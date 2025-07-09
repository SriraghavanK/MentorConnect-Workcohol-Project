from django.db import models
from django.contrib.auth.models import User

class Expertise(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Expertise"

class MentorProfile(models.Model):
    EXPERIENCE_LEVELS = (
        ('junior', 'Junior (1-3 years)'),
        ('mid', 'Mid-level (3-7 years)'),
        ('senior', 'Senior (7-15 years)'),
        ('expert', 'Expert (15+ years)'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    expertise = models.ManyToManyField(Expertise, related_name='mentors')
    experience_years = models.IntegerField(default=0)
    experience_level = models.CharField(max_length=10, choices=EXPERIENCE_LEVELS, default='junior')
    company = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    availability = models.TextField(help_text="Describe your availability for mentorship sessions")
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    total_sessions = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    def __str__(self):
        return f"{self.user.username} - Mentor"
    
    class Meta:
        verbose_name = "Mentor Profile"
        verbose_name_plural = "Mentor Profiles"
