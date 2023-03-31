from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated
from transliterate.utils import _


class AuthByEmailPasswordSerializer(serializers.Serializer):
    email = serializers.CharField(label=_("email"), write_only=True, trim_whitespace=True, max_length=32)
    password = serializers.CharField(label=_("Password"), style={'input_type': 'password'}, trim_whitespace=True,
                                     write_only=True, max_length=32)
    # token = serializers.CharField(label=_("Token"), read_only=True)
    remember_me = serializers.BooleanField(label=_("Remember me"), write_only=True, default=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            msg = 'Unable to log in with provided credentials.'
            raise NotAuthenticated(msg, 'authorization')

        del attrs['email']
        del attrs['password']

        attrs['user'] = user
        return attrs