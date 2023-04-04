import logging

from django.contrib.auth import get_user_model
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import parsers, permissions, renderers, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from dadata import Dadata

from core.models import StoragePoi
from core.serializers import AuthByEmailPasswordSerializer, StoragePoiSerializer, UserSerializer, CreateUserSerializer
from locker import settings

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
        remember_me = data.pop('remember_me')
        token = Token.objects.get_or_create(user=user)[0]

        response = Response()

        params = dict()
        if remember_me:
            params['max_age'] = 946080000

        response.set_cookie('access_token', token, httponly=True, secure=settings.ACCESS_TOKEN_COOKIE_SECURE, **params)
        return response


class LogoutView(APIView):
    def post(self, request, format=None):
        request.auth.delete()

        response = Response()
        response.delete_cookie('access_token')
        return response


class StoragePoiViewSet(ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = StoragePoiSerializer

    def get_queryset(self):
        return StoragePoi.objects.all()


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
