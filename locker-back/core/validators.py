import re

from django.contrib.auth.password_validation import MinimumLengthValidator
from django.core.exceptions import ValidationError
from django.utils.functional import SimpleLazyObject
from django.utils.translation import gettext as _, ngettext
import django.contrib.auth.password_validation as pass_validation
from django.contrib.auth import get_user_model


class MyMinimumLengthValidator(MinimumLengthValidator):
    def __init__(self, get_min_length):
        super().__init__()
        self.min_length = SimpleLazyObject(lambda: self.get_min_length())
        self.get_min_length = get_min_length

    def __call__(self, password):
        if len(password) < self.get_min_length():
            raise ValidationError(
                ngettext(
                    "This password is too short. It must contain at least %(min_length)d character.",
                    "This password is too short. It must contain at least %(min_length)d characters.",
                    self.get_min_length()
                ),
                code='password_too_short',
                params={'min_length': self.get_min_length()},
            )


class SymbolsCountValidator:
    def __init__(self, symbols, get_min_count, target):
        self.symbols = symbols
        self.get_min_count = get_min_count
        self.target = target

    def __call__(self, password):
        only_spec = re.sub(fr"[^{''.join(self.symbols)}]", '', password)
        if len(only_spec) < self.get_min_count():
            raise ValidationError(
                _(
                    "This password contains too few %(target)s(s/es). It must contain at least %(min_count)d %(target)s(s/es)."
                ),
                code='symbols_too_little_number',
                params={'min_count': self.get_min_count(), 'target': self.target},
            )


class ConditionValidator:
    def __init__(self, condition_func, validator):
        self.condition_func = condition_func
        self.validator = validator

    def __call__(self, password):
        if self.condition_func():
            return self.validator(password)


class MixedRegistersValidator:
    def __call__(self, password):
        if password.islower() or password.isupper() or not re.search('[a-zA-Z]', password):
            raise ValidationError(
                _("Password must contain characters of different registers"),
                code='mixed_casing_error'
            )


class EntirelyNumericValidator:
    def __call__(self, password):
        if password.isdigit():
            raise ValidationError(
                _("Password must contain not only digits"), code='only_digits_error'
            )


class CommonPasswordValidator:
    def __call__(self, password):
        error = None
        try:
            pass_validation.validate_password(password=password, user=get_user_model())
        except ValidationError:
            error = _("Password is too common, please type more complex password")

        if error:
            raise ValidationError(error, code='too_common_password_error')
