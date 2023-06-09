"""locker URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions, routers

from core import views


schema_view = get_schema_view(
    openapi.Info(
        title="Locker API",
        default_version='v1',
    ),
    public=True,
    permission_classes=[permissions.AllowAny]
)

api_router = routers.DefaultRouter(trailing_slash=False)
api_router.register(r'user', views.UserViewSet, basename='user')
api_router.register(r'storage-poi', views.StoragePoiViewSet, basename='storage-poi')
api_router.register(r'order', views.OrderViewSet, basename='order')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth', views.ObtainAuthToken.as_view(), name='auth'),
    path('api/v1/logout', views.LogoutView.as_view(), name='logout'),
    path('api/v1/', include(api_router.urls)),
    path('api/v1/address-autocomplete', views.AddressAutocomplete.as_view(), name='address_autocomplete'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/activate/<str:token>', views.ActivateUser.as_view(), name='activate'),
    path('swagger', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
