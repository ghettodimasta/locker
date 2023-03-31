from django.shortcuts import render
from django.utils.decorators import method_decorator
from rest_framework import parsers, permissions, renderers, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from core.serializers import AuthByEmailPasswordSerializer
from locker import settings


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
        print(response.cookies)
        print(response)
        return response


class LogoutView(APIView):
    def post(self, request, format=None):
        request.auth.delete()

        response = Response()
        response.delete_cookie('access_token')
        return response
