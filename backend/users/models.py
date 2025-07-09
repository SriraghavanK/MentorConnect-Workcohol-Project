from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class UserProfile(models.Model):
    USER_TYPES = (
        ('mentor', 'Mentor'),
        ('mentee', 'Mentee'),
        ('admin', 'Admin'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='mentee')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type}"
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_save, sender=UserProfile)
def create_mentor_profile(sender, instance, created, **kwargs):
    """Create MentorProfile when UserProfile is created or updated with user_type='mentor'"""
    if instance.user_type == 'mentor':
        from mentors.models import MentorProfile
        MentorProfile.objects.get_or_create(
            user=instance.user,
            defaults={
                'hourly_rate': 50.00,
                'experience_level': 'junior',
                'availability': 'Flexible',
                'is_active': True
            }
        )
    elif instance.user_type != 'mentor':
        # If user_type is changed from mentor to something else, delete MentorProfile
        from mentors.models import MentorProfile
        try:
            mentor_profile = MentorProfile.objects.get(user=instance.user)
            mentor_profile.delete()
        except MentorProfile.DoesNotExist:
            pass
