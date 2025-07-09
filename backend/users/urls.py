from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserProfileViewSet, UserRegistrationViewSet
from django.urls import path

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='userprofile')

user_registration = UserRegistrationViewSet.as_view({'post': 'register'})

urlpatterns = router.urls
urlpatterns += [
    # Registration endpoint
    path('register/', user_registration, name='user-register'),
] 