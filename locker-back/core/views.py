import datetime
import logging
import rest_framework.exceptions
import django_filters

from django.contrib.auth import get_user_model
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import parsers, permissions, renderers, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from dadata import Dadata

from core.models import StoragePoi, Order
from core.serializers import AuthByEmailPasswordSerializer, StoragePoiSerializer, UserSerializer, CreateUserSerializer, \
    OrderSerializer
from locker import settings
from locker.utils import generate_qr_code

logger = logging.getLogger(__name__)

User = get_user_model()


# Create your views here.

class ObtainAuthToken(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthByEmailPasswordSerializer

    def get_authenticate_header(self, request):
        return status.HTTP_401_UNAUTHORIZED

    def get_serializer_context(self):
        return {'request': self.request, 'format': self.format_kwarg, 'view': self}

    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        return self.serializer_class(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = data['user']
        if not user.is_active:
            return rest_framework.exceptions.ValidationError('User account is disabled.', 'authorization')
        remember_me = data.pop('remember_me')
        token = Token.objects.get_or_create(user=user)[0]

        response = Response(data=dict(id=user.id, email=user.email, role=user.role.id))

        params = dict()
        if remember_me:
            params['max_age'] = 946080000

        response.set_cookie('access_token', token, httponly=False, secure=settings.ACCESS_TOKEN_COOKIE_SECURE, **params)
        return response


class LogoutView(APIView):
    def post(self, request, format=None):
        request.auth.delete()

        response = Response()
        response.delete_cookie('access_token')
        return response


class StoragePoiFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr='icontains', field_name='address_clean')

    class Meta:
        model = StoragePoi
        fields = ['city']


class StoragePoiViewSet(ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = StoragePoiSerializer
    filterset_class = StoragePoiFilter
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return StoragePoi.objects.all()

    @action(detail=False, methods=['get'])
    def cities(self, request):
        cities = StoragePoi.objects.all().values_list('dadata_info', flat=True)
        cities = [city['city'] if city['city'] else city['region'] for city in cities]
        cities = list(set(cities))
        return Response(dict(cities=cities))


class AddressAutocomplete(APIView):

    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("q", openapi.IN_QUERY, description="address", type=openapi.TYPE_STRING,
                              required=True),
        ],
    )
    def get(self, request):
        try:
            with Dadata(settings.DADATA_TOKEN, settings.DADATA_SECRET) as dadata:
                suggests = dadata.suggest(name="address", query=request.GET.get("q"))
                results = [
                    dict(
                        value=suggest.get("unrestricted_value"),
                        label=suggest.get("value"),
                        lat=suggest.get("data").get("geo_lat"),
                        lon=suggest.get("data").get("geo_lon"),
                        city=suggest.get("data").get("city"),
                    )
                    for suggest in suggests
                ]
            return Response(results)
        except Exception as e:
            logger.exception(f"Dadata failed: {e}")
            return Response(data=dict(error=e))


class UserViewSet(ModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.all()

    def get_serializer_class(self):
        if self.action in ['create']:
            return CreateUserSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def current(self, request):
        return Response(UserSerializer(self.request.user).data)


class OrderViewSet(ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


    @action(detail=False, methods=['get'], url_path='check_pin_code/(?P<storage_id>[^/.]+)')
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("pin_code", openapi.IN_QUERY, description="pin code", type=openapi.TYPE_STRING,
                              required=True),
        ],
    )
    def check_pin_code(self, request, storage_id):
        order: Order = Order.objects.filter(storage_poi=storage_id, pin_code=request.GET.get('pin_code')).first()
        if not order:
            return Response({'status': 'error', 'message': 'Invalid pin code or the order is not active.'})
        if order.status == "checked_out":
            return Response({'status': 'error', 'message': 'The order is already checked out.'})
        if not order.is_payed_for_extra_days and order.is_expired and order.status == "checked_in":
            order.amount = order.bags * 500 * order.expired_days
            order.save()
            return Response({'status': 'error', 'message': f'You need to pay for extra days before check out.'
                                                           f' Extra days: {order.expired_days}, amount: {order.amount}'})
        if order.status == "checked_in" and not order.is_payed and not order.is_payed_for_extra_days:
            tz_now = timezone.now()
            if order.check_out < tz_now:
                order.recalculated_amount(tz_now)
            return Response({'status': 'error', 'message': 'You need to pay order before check out'})
        if order.status == "checked_in" and order.is_payed and order.is_payed_for_extra_days:
            order.status = "checked_out"
            order.save()
            return Response({'status': 'ok'})
        if order.is_available_for_check_in:
            order.status = "checked_in"
            order.save()
            return Response({'status': 'ok'})
        return Response({'status': 'error', 'message': 'Invalid pin code or the order is not active.'})

    @action(detail=True, methods=['get'])
    def pay(self, request, pk):
        order : Order = self.get_object()
        if order.status not in ["created", "checked_in"] and not order.is_payed_for_extra_days:
            return Response({'status': 'error', 'message': 'You can not pay for this order'})
        if not order.is_payed_for_extra_days and order.is_expired and order.status == "checked_in":
            order.is_payed_for_extra_days = True
            order.check_out = order.check_out + datetime.timedelta(days=order.expired_days)
            order.recalculated_amount()
            return Response({'status': 'ok'})
        order.is_payed = True
        order.save()
        return Response({'status': 'ok', 'pin_code': order.pin_code})


class ActivateUser(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("token", openapi.IN_PATH, description="token", type=openapi.TYPE_STRING,
                              required=True),
        ],
    )
    def get(self, request, token):
        try:
            user = User.objects.get(activation_token=token)
        except User.DoesNotExist:
            return Response({'status': 'error', 'message': 'Invalid token'})
        user.is_active = True
        user.save()
        return Response({'status': 'ok', 'text': 'Your account is activated. You can login now.'})
