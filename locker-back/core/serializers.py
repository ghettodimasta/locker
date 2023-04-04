from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated
from transliterate.utils import _

from core.models import StoragePoi, User, Order
from core.validators import MyMinimumLengthValidator, SymbolsCountValidator, ConditionValidator, \
    MixedRegistersValidator, EntirelyNumericValidator, CommonPasswordValidator
from locker import settings


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


class StoragePoiSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoragePoi
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True},
            'address': {'write_only': True},
            'address_clean': {'read_only': True},
            'location': {'write_only': True},
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role')


class CreateUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True,
                                     validators=[MyMinimumLengthValidator(lambda: settings.MIN_PASSWORD_LENGTH),
                                                 SymbolsCountValidator(settings.SPECIAL_PASSWORD_SYMBOLS,
                                                                       lambda: settings.MIN_SPECIAL_PASSWORD_SYMBOLS_COUNT,
                                                                       'special character'),
                                                 SymbolsCountValidator(settings.DECIMAL_SYMBOLS,
                                                                       lambda: settings.MIN_DIGITS_IN_PASSWORD_COUNT,
                                                                       'digit'),
                                                 ConditionValidator(
                                                     lambda: settings.PASSWORD_DIFFERENT_REGISTER_MANDATORY,
                                                     MixedRegistersValidator()),
                                                 EntirelyNumericValidator(),
                                                 CommonPasswordValidator()])

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'password')
        extra_kwargs = {
            'role': {'required': True},
        }

    def create(self, validated_data):
        user = super().create(validated_data)
        password = validated_data['password']
        user.set_password(password)
        user.save(update_fields=['password'])
        return user


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    bags = serializers.IntegerField(min_value=1, max_value=10, required=True)
    check_in = serializers.DateTimeField(required=True)
    check_out = serializers.DateTimeField(required=True)

    class Meta:
        model = Order
        fields = '__all__'
        extra_kwargs = {
            'user': {'write_only': True},
            'storage': {'write_only': True},
            'status': {'read_only': True},
            'amount': {'read_only': True},
            'is_active': {'read_only': True},
            'payment_type': {'required': True},
        }