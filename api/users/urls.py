# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, MeView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/',    LoginView.as_view()),
    path('logout/',   LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),  # built-in, no custom code needed
    path('me/',       MeView.as_view()),
]

