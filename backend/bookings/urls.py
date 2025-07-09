from rest_framework.routers import DefaultRouter # type: ignore
from .views import BookingViewSet, confirm_booking, create_booking_with_payment, confirm_booking_payment
from django.urls import path

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = [
    path('create-with-payment/', create_booking_with_payment, name='create-booking-with-payment'),
    path('confirm-payment/', confirm_booking_payment, name='confirm-booking-payment'),
    path('confirm/', confirm_booking, name='confirm-booking'),
] + router.urls 