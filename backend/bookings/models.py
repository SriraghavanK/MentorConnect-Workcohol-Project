from django.db import models
from django.contrib.auth.models import User
from mentors.models import MentorProfile

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    SESSION_TYPES = (
        ('video_call', 'Video Call'),
        ('audio_call', 'Audio Call'),
        ('chat', 'Chat'),
        ('in_person', 'In Person'),
    )
    
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_mentee')
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='bookings')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, default='video_call')
    session_date = models.DateField()
    session_time = models.TimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    topic = models.CharField(max_length=200, help_text="What would you like to discuss?")
    description = models.TextField(blank=True, null=True, help_text="Additional details about the session")
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    onsite_address = models.CharField(max_length=255, blank=True, null=True, help_text="Address for onsite sessions")
    
    def __str__(self):
        return f"{self.mentee.username} - {self.mentor.user.username} - {self.session_date}"
    
    class Meta:
        ordering = ['-session_date', '-session_time']
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
