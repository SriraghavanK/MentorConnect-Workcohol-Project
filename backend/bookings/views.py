from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from .email_utils import send_booking_notification_to_mentor, send_booking_confirmation_to_mentee, send_booking_status_update
import uuid
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import stripe
import json
from payments.models import Payment
from payments.serializers import CreatePaymentIntentSerializer
from decimal import Decimal

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Create your views here.

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()     #type:ignore
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def auto_complete_past_bookings(self):
        from django.utils import timezone
        from datetime import datetime, timedelta
        now = timezone.localtime()
        bookings = Booking.objects.filter(status__in=['pending', 'confirmed', 'in_progress'])
        for booking in bookings:
            if booking.session_date and booking.session_time:
                session_datetime = datetime.combine(booking.session_date, booking.session_time)
                session_datetime = timezone.make_aware(session_datetime)
                session_end = session_datetime + timedelta(minutes=booking.duration_minutes or 60)
                print(f"Booking {booking.id}: session_datetime={session_datetime}, session_end={session_end}, now={now}, status={booking.status}")
                if session_datetime <= now < session_end:
                    if booking.status != 'in_progress':
                        booking.status = 'in_progress'
                        booking.save()
                elif now >= session_end:
                    if booking.status != 'completed':
                        booking.status = 'completed'
                        booking.save()
                # else: keep as pending/confirmed

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Booking.objects.all()    #type:ignore
        
        # If user is a mentor, show bookings where they are the mentor
        if hasattr(user, 'profile') and user.profile.user_type == 'mentor':
            return Booking.objects.filter(mentor__user=user)    #type:ignore
        
        # If user is a mentee, show their bookings
        return Booking.objects.filter(mentee=user)    #type:ignore

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        booking = serializer.save(mentee=self.request.user)
        print(f"DEBUG: Created booking with meeting_link: {booking.meeting_link}")
        print(f"DEBUG: Booking session_type: {booking.session_type}")
        # Send notification email to mentor
        send_booking_notification_to_mentor(booking)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Mentor accepts a booking"""
        # Get the booking directly without queryset filtering
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the mentor for this booking
        if booking.mentor.user != request.user:
            return Response({'error': 'Only the mentor can accept this booking'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if booking.status != 'pending':
            return Response({'error': 'Only pending bookings can be accepted'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'confirmed'
        
        # Generate Google Meet link for video calls if not already set
        if booking.session_type == 'video_call' and not booking.meeting_link:
            # Generate a unique meeting link using booking ID and timestamp
            meeting_id = f"mentor-{booking.id}-{uuid.uuid4().hex[:8]}"
            booking.meeting_link = f"https://meet.google.com/{meeting_id}"
            print(f"DEBUG: Generated meeting link: {booking.meeting_link}")
        else:
            print(f"DEBUG: Meeting link already exists or not video call: {booking.meeting_link}")
        
        booking.save()
        
        # Send confirmation email to mentee (includes meeting link and all details)
        send_booking_confirmation_to_mentee(booking)
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Mentor declines a booking"""
        # Get the booking directly without queryset filtering
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the mentor for this booking
        if booking.mentor.user != request.user:
            return Response({'error': 'Only the mentor can decline this booking'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if booking.status != 'pending':
            return Response({'error': 'Only pending bookings can be declined'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        
        # Send status update email
        send_booking_status_update(booking, 'declined')
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed"""
        # Get the booking directly without queryset filtering
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the mentor for this booking
        if booking.mentor.user != request.user:
            return Response({'error': 'Only the mentor can complete this booking'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if booking.status != 'confirmed':
            return Response({'error': 'Only confirmed bookings can be completed'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'completed'
        booking.save()
        
        # Send status update email
        send_booking_status_update(booking, 'completed')
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking (mentee or mentor)"""
        # Get the booking directly without queryset filtering
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the mentee or mentor
        if booking.mentee != request.user and booking.mentor.user != request.user:
            return Response({'error': 'You can only cancel your own bookings'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if booking.status in ['completed', 'cancelled']:
            return Response({'error': 'This booking cannot be cancelled'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        
        # Send status update email
        send_booking_status_update(booking, 'cancelled')
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        self.auto_complete_past_bookings()
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        queryset = self.get_queryset()
        
        # Filter for upcoming sessions based on session end time
        upcoming_bookings = []
        for booking in queryset:
            if booking.session_date and booking.session_time:
                # Combine date and time to create a datetime
                from datetime import datetime
                session_datetime = datetime.combine(booking.session_date, booking.session_time)
                # Make it timezone-aware
                session_datetime = timezone.make_aware(session_datetime)
                # Calculate session end time (session_datetime + duration_minutes)
                session_end = session_datetime + timedelta(minutes=booking.duration_minutes or 60)
                # Only include if session hasn't ended yet and status is valid
                if session_end > now and booking.status in ['pending', 'in_progress']:
                    upcoming_bookings.append(booking)
        
        serializer = self.get_serializer(upcoming_bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past bookings"""
        self.auto_complete_past_bookings()
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        queryset = self.get_queryset()
        
        # Filter for past sessions based on session end time or status
        past_bookings = []
        for booking in queryset:
            # Include if status is completed or cancelled
            if booking.status in ['completed', 'cancelled']:
                past_bookings.append(booking)
            # Or if session has passed its end time
            elif booking.session_date and booking.session_time:
                # Combine date and time to create a datetime
                from datetime import datetime
                session_datetime = datetime.combine(booking.session_date, booking.session_time)
                # Make it timezone-aware
                session_datetime = timezone.make_aware(session_datetime)
                # Calculate session end time (session_datetime + duration_minutes)
                session_end = session_datetime + timedelta(minutes=booking.duration_minutes or 60)
                # Include if session has ended
                if session_end <= now:
                    past_bookings.append(booking)
        
        serializer = self.get_serializer(past_bookings, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        self.auto_complete_past_bookings()
        return super().list(request, *args, **kwargs)

@csrf_exempt
def confirm_booking(request):
    if request.method == "POST":
        data = json.loads(request.body)
        booking_id = data.get("booking_id")
        payment_intent_id = data.get("payment_intent_id")
        try:
            booking = Booking.objects.get(id=booking_id)
            # Mark booking as paid/confirmed
            booking.status = "confirmed"
            booking.payment_intent_id = payment_intent_id
            booking.save()
            # If video call, generate Google Meet link (placeholder for now)
            if booking.session_type == "video":
                # TODO: Integrate Google Calendar API for real Meet link
                meet_link = "https://meet.google.com/" + str(booking.id)
                booking.meet_link = meet_link
                booking.save()
                return JsonResponse({"meet_link": meet_link})
            elif booking.session_type == "physical":
                return JsonResponse({"address": booking.address})
            else:
                return JsonResponse({"message": "Booking confirmed"})
        except Booking.DoesNotExist:
            return JsonResponse({"error": "Booking not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_booking_with_payment(request):
    """Create a booking with payment intent - payment-first approach"""
    try:
        # Validate booking data
        booking_serializer = BookingCreateSerializer(data=request.data)
        if not booking_serializer.is_valid():
            return Response(booking_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total amount
        booking_data = booking_serializer.validated_data
        mentor = booking_data['mentor']
        duration_minutes = booking_data.get('duration_minutes', 60)
        duration_hours = Decimal(str(duration_minutes)) / Decimal('60')
        total_amount = mentor.hourly_rate * duration_hours
        
        # Create payment intent data
        payment_data = {
            'amount': int(total_amount * 100),  # Convert to cents
            'currency': 'usd',
            'booking_data': booking_data
        }
        
        # Create payment intent
        payment_serializer = CreatePaymentIntentSerializer(data=payment_data)
        if not payment_serializer.is_valid():
            return Response(payment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create Stripe payment intent
        print(f"Using Stripe key: {settings.STRIPE_SECRET_KEY[:20]}...")
        
        # Prepare only serializable fields for metadata
        serializable_booking_data = {
            'session_type': booking_data.get('session_type'),
            'session_date': str(booking_data.get('session_date')),
            'session_time': str(booking_data.get('session_time')),
            'duration_minutes': str(booking_data.get('duration_minutes')),
            'topic': booking_data.get('topic'),
            'description': booking_data.get('description'),
            'onsite_address': booking_data.get('onsite_address', ''),
            'mentor_id': str(mentor.id),
            'mentee_id': str(request.user.id)
        }
        
        payment_intent = stripe.PaymentIntent.create(
            amount=payment_data['amount'],
            currency=payment_data['currency'],
            metadata=serializable_booking_data
        )
        
        return Response({
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id,
            'amount': total_amount,
            'currency': 'usd'
        })
        
    except Exception as e:
        print(f"Error creating booking with payment: {str(e)}")
        return Response(
            {'error': f'Failed to create payment intent: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_booking_payment(request):
    """Confirm payment and create booking"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        if not payment_intent_id:
            return Response(
                {'error': 'Payment intent ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify payment with Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status != 'succeeded':
            return Response(
                {'error': 'Payment not completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract booking data from metadata
        booking_data = {
            'session_type': payment_intent.metadata.get('session_type'),
            'session_date': payment_intent.metadata.get('session_date'),
            'session_time': payment_intent.metadata.get('session_time'),
            'duration_minutes': int(payment_intent.metadata.get('duration_minutes', 60)),
            'topic': payment_intent.metadata.get('topic'),
            'description': payment_intent.metadata.get('description'),
            'onsite_address': payment_intent.metadata.get('onsite_address'),
            'mentor': int(payment_intent.metadata.get('mentor_id'))
        }
        print("Booking data for serializer:", booking_data)
        
        # Create the booking
        booking_serializer = BookingCreateSerializer(data=booking_data)
        if not booking_serializer.is_valid():
            print("Booking serializer errors:", booking_serializer.errors)
            return Response(booking_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        booking = booking_serializer.save(mentee=request.user)
        
        # Create payment record
        Payment.objects.create(
            booking=booking,
            user=request.user,
            payment_intent_id=payment_intent_id,
            amount=payment_intent.amount / 100,  # Convert from cents
            currency=payment_intent.currency,
            status='completed'
        )
        
        # Generate Google Meet link for video calls
        if booking.session_type == 'video_call':
            meeting_id = f"mentor-{booking.id}-{uuid.uuid4().hex[:8]}"
            booking.meeting_link = f"https://meet.google.com/{meeting_id}"
            booking.save()
        
        # Send confirmation emails
        send_booking_notification_to_mentor(booking)
        send_booking_confirmation_to_mentee(booking)
        
        return Response({
            'message': 'Booking created successfully',
            'booking_id': booking.id,
            'meeting_link': booking.meeting_link
        })
        
    except Exception as e:
        import traceback
        print("Error confirming booking payment:", str(e))
        traceback.print_exc()
        return Response(
            {'error': f'Failed to confirm payment: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
