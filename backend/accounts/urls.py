from django.urls import path
from .views import (
    register_user,
    MyTokenObtainPairView,
    MyTokenRefreshView,
    get_users,
    user_profile
)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', MyTokenRefreshView.as_view(), name='token_refresh'),
    path('users/', get_users, name='get_users'),
    path('profile/', user_profile, name='profile'),
]