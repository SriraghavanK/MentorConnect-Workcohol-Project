from django.shortcuts import render
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment
from .serializers import CreatePaymentIntentSerializer, ConfirmPaymentSerializer, PaymentSerializer
from bookings.models import Booking
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a test Payment Intent for a booking"""
    serializer = CreatePaymentIntentSerializer(data=request.data)
    if serializer.is_valid():
        booking_id = serializer.validated_data['booking_id']
        amount = serializer.validated_data['amount']
        currency = serializer.validated_data['currency']
        
        # Get the booking
        booking = get_object_or_404(Booking, id=booking_id, mentee=request.user)
        
        try:
            # Create a simple test payment intent
            payment_intent_id = f"pi_test_{uuid.uuid4().hex[:24]}"
            
            # Create Payment record
            payment = Payment.objects.create(
                booking=booking,
                user=request.user,
                payment_intent_id=payment_intent_id,
                amount=amount,
                currency=currency,
                status='pending'
            )
            
            return Response({
                'client_secret': f"pi_test_secret_{uuid.uuid4().hex[:24]}",
                'payment_intent_id': payment_intent_id,
                'amount': amount,
                'currency': currency
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """Confirm a test payment"""
    serializer = ConfirmPaymentSerializer(data=request.data)
    if serializer.is_valid():
        payment_intent_id = serializer.validated_data['payment_intent_id']
        
        try:
            # Get the payment record
            payment = get_object_or_404(Payment, payment_intent_id=payment_intent_id, user=request.user)
            
            # Simulate a successful test payment
            print(f"Confirming test payment for intent: {payment_intent_id}")
            
            # Update payment status
            payment.status = 'completed'
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.status = 'confirmed'
            booking.save()
            
            # Send confirmation email
            from bookings.email_utils import send_booking_confirmation_to_mentee, send_booking_status_update
            send_booking_confirmation_to_mentee(booking)
            send_booking_status_update(booking, 'accepted')
            
            return Response({
                'message': 'Test payment confirmed successfully',
                'payment_id': payment.id,
                'booking_id': booking.id
            })
            
        except Exception as e:
            print(f"Payment confirmation error: {str(e)}")
            return Response(
                {'error': f'Payment confirmation failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    print(f"Payment confirmation serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_intent_id):
    """Get payment status"""
    try:
        payment = get_object_or_404(Payment, payment_intent_id=payment_intent_id, user=request.user)
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
