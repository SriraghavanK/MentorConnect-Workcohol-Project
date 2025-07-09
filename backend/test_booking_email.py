#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentorship.settings')
django.setup()

from django.contrib.auth.models import User
from mentors.models import MentorProfile
from bookings.models import Booking
from bookings.email_utils import send_booking_confirmation_to_mentee
from datetime import date, time
import uuid

def test_booking_with_meeting_link():
    print("Testing booking creation with Google Meet link...")
    
    # Get or create test users
    mentee, created = User.objects.get_or_create(
        username='test_mentee',
        defaults={
            'email': 'mentee@test.com',
            'first_name': 'Test',
            'last_name': 'Mentee'
        }
    )
    
    mentor_user, created = User.objects.get_or_create(
        username='test_mentor',
        defaults={
            'email': 'mentor@test.com',
            'first_name': 'Test',
            'last_name': 'Mentor'
        }
    )
    
    mentor_profile, created = MentorProfile.objects.get_or_create(
        user=mentor_user,
        defaults={
            'hourly_rate': 50.00,
            'availability': 'Available for test sessions'
        }
    )
    
    # Create a test booking
    booking = Booking.objects.create(
        mentee=mentee,
        mentor=mentor_profile,
        session_type='video_call',
        session_date=date.today(),
        session_time=time(14, 0),  # 2:00 PM
        duration_minutes=60,
        topic='Test Session',
        description='This is a test session',
        total_amount=50.00,
        status='confirmed'
    )
    
    # Generate meeting link
    meeting_id = f"mentor-{booking.id}-{uuid.uuid4().hex[:8]}"
    booking.meeting_link = f"https://meet.google.com/{meeting_id}"
    booking.save()
    
    print(f"Created booking ID: {booking.id}")
    print(f"Meeting link: {booking.meeting_link}")
    print(f"Session type: {booking.session_type}")
    
    # Test email sending
    print("\nTesting email sending...")
    try:
        result = send_booking_confirmation_to_mentee(booking)
        print(f"Email sent successfully: {result}")
    except Exception as e:
        print(f"Email sending failed: {e}")
    
    return booking

if __name__ == '__main__':
    test_booking_with_meeting_link() 