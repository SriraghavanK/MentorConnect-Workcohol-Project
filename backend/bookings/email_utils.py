from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_booking_notification_to_mentor(booking):
    """Send notification email to mentor when a new booking is created"""
    print(f"Attempting to send email to mentor: {booking.mentor.user.email}")
    print(f"From email: {settings.DEFAULT_FROM_EMAIL}")
    print(f"Email host: {settings.EMAIL_HOST}")
    print(f"Email port: {settings.EMAIL_PORT}")
    print(f"Email user: {settings.EMAIL_HOST_USER}")
    try:
        subject = f'New Session Request from {booking.mentee.get_full_name() or booking.mentee.username}'
        
        # Create email content
        html_message = f"""
        <html>
        <body>
            <h2>New Session Request</h2>
            <p>Hello {booking.mentor.user.get_full_name() or booking.mentor.user.username},</p>
            <p>You have received a new session request from {booking.mentee.get_full_name() or booking.mentee.username}.</p>
            
            <h3>Session Details:</h3>
            <ul>
                <li><strong>Date:</strong> {booking.session_date}</li>
                <li><strong>Time:</strong> {booking.session_time}</li>
                <li><strong>Duration:</strong> {booking.duration_minutes} minutes</li>
                <li><strong>Session Type:</strong> {booking.get_session_type_display()}</li>
                <li><strong>Topic:</strong> {booking.topic}</li>
                <li><strong>Amount:</strong> ${booking.total_amount}</li>
            </ul>
            
            {f'<p><strong>Description:</strong> {booking.description}</p>' if booking.description else ''}
            
            <p>Please log in to your dashboard to accept or decline this request.</p>
            
            <p>Best regards,<br>MentorConnect Team</p>
        </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        result = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.mentor.user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f"Email send result: {result}")
        return True
    except Exception as e:
        print(f"Failed to send email to mentor: {e}")
        return False

def send_booking_confirmation_to_mentee(booking):
    """Send confirmation email to mentee when booking is confirmed"""
    print(f"DEBUG: Booking meeting_link: {booking.meeting_link}")
    print(f"DEBUG: Booking session_type: {booking.session_type}")
    try:
        subject = f'Session Confirmed with {booking.mentor.user.get_full_name() or booking.mentor.user.username}'
        
        # Create email content
        html_message = f"""
        <html>
        <body>
            <h2>Session Confirmed!</h2>
            <p>Hello {booking.mentee.get_full_name() or booking.mentee.username},</p>
            <p>Your session with {booking.mentor.user.get_full_name() or booking.mentor.user.username} has been confirmed!</p>
            
            <h3>Session Details:</h3>
            <ul>
                <li><strong>Date:</strong> {booking.session_date}</li>
                <li><strong>Time:</strong> {booking.session_time}</li>
                <li><strong>Duration:</strong> {booking.duration_minutes} minutes</li>
                <li><strong>Session Type:</strong> {booking.get_session_type_display()}</li>
                <li><strong>Topic:</strong> {booking.topic}</li>
                <li><strong>Amount:</strong> ${booking.total_amount}</li>
            </ul>
            
            {f'<p><strong>Description:</strong> {booking.description}</p>' if booking.description else ''}
            
            {f'<p><strong>Meeting Link:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>' if booking.session_type == 'video_call' and booking.meeting_link else ''}
            {f'<p><strong>Location:</strong> {booking.onsite_address}</p>' if booking.session_type == 'onsite' and booking.onsite_address else ''}
            
            <p>Please log in to your dashboard to view full details and manage your session.</p>
            
            <p>Best regards,<br>MentorConnect Team</p>
        </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.mentee.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
    except Exception as e:
        print(f"Failed to send confirmation email to mentee: {e}")
        return False

def send_booking_status_update(booking, action):
    """Send status update email when booking status changes"""
    try:
        if action == 'accepted':
            subject = f'Session Accepted by {booking.mentor.user.get_full_name() or booking.mentor.user.username}'
            message = f"Your session request has been accepted by {booking.mentor.user.get_full_name() or booking.mentor.user.username}."
            recipient = booking.mentee.email
        elif action == 'declined':
            subject = f'Session Declined by {booking.mentor.user.get_full_name() or booking.mentor.user.username}'
            message = f"Your session request has been declined by {booking.mentor.user.get_full_name() or booking.mentor.user.username}."
            recipient = booking.mentee.email
        elif action == 'completed':
            subject = f'Session Completed with {booking.mentee.get_full_name() or booking.mentee.username}'
            message = f"Your session with {booking.mentee.get_full_name() or booking.mentee.username} has been marked as completed."
            recipient = booking.mentor.user.email
        elif action == 'cancelled':
            subject = f'Session Cancelled'
            message = f"Your session scheduled for {booking.session_date} at {booking.session_time} has been cancelled."
            # Send to both parties
            recipients = [booking.mentee.email, booking.mentor.user.email]
        else:
            return False
        
        html_message = f"""
        <html>
        <body>
            <h2>{subject}</h2>
            <p>{message}</p>
            
            <h3>Session Details:</h3>
            <ul>
                <li><strong>Date:</strong> {booking.session_date}</li>
                <li><strong>Time:</strong> {booking.session_time}</li>
                <li><strong>Duration:</strong> {booking.duration_minutes} minutes</li>
                <li><strong>Session Type:</strong> {booking.get_session_type_display()}</li>
                <li><strong>Topic:</strong> {booking.topic}</li>
            </ul>
            
            {f'<p><strong>Meeting Link:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>' if booking.session_type == 'video_call' and booking.meeting_link else ''}
            {f'<p><strong>Location:</strong> {booking.onsite_address}</p>' if booking.session_type == 'onsite' and booking.onsite_address else ''}
            
            <p>Please log in to your dashboard for more details.</p>
            
            <p>Best regards,<br>MentorConnect Team</p>
        </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        if action == 'cancelled':
            # Send to both parties for cancellation
            for recipient in recipients:
                send_mail(
                    subject=subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    html_message=html_message,
                    fail_silently=False,
                )
        else:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_message,
                fail_silently=False,
            )
        
        return True
    except Exception as e:
        print(f"Failed to send status update email: {e}")
        return False 