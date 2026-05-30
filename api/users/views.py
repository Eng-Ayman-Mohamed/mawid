from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema
from .models import UserRole
from .serializers import RegisterSerializer, UserSerializer


@extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user':    UserSerializer(user).data,
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request={'application/json': {'type': 'object', 'properties': {
        'email': {'type': 'string', 'format': 'email'},
        'password': {'type': 'string'},
    }, 'required': ['email', 'password']}},
    responses={200: UserSerializer}
)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')
        user     = authenticate(request, username=email, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        if user.is_blocked:
            return Response({'error': 'Your account has been blocked.'}, status=status.HTTP_403_FORBIDDEN)
        if user.role == UserRole.DOCTOR and not user.is_approved:
            return Response({'error': 'Your account is pending admin approval.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        })


@extend_schema(
    request={'application/json': {'type': 'object', 'properties': {
        'refresh': {'type': 'string'},
    }, 'required': ['refresh']}},
    responses={205: None}
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except (TokenError, KeyError):
            return Response({'error': 'Invalid or missing token'}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(responses={200: UserSerializer})
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
