from django.urls import resolve
from rest_framework import exceptions
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BaseAuthentication
from rest_framework.exceptions import ValidationError


class CookieAuthentication(TokenAuthentication):
    """
    Extend the TokenAuthentication class to support cookie based authentication
    """
    keyword = 'Token'
    model = None

    def get_model(self):
        if self.model is not None:
            return self.model
        from rest_framework.authtoken.models import Token
        return Token

    def authenticate(self, request):
        from rest_framework.authtoken.models import Token
        # Check if 'auth_token' is in the request cookies.
        # Give precedence to 'Authorization' header.
        if 'access_token' in request.COOKIES:
            at = Token.objects.filter(key=request.COOKIES['access_token']).first()
            if not at:
                raise exceptions.AuthenticationFailed('Invalid token.')

            if not at.user.is_active:
                raise exceptions.AuthenticationFailed('User inactive or deleted.')

            return at.user, at
        return super().authenticate(request)