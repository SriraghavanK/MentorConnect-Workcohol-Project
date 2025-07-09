from django.core.management.base import BaseCommand
from users.models import UserProfile
from mentors.models import MentorProfile

class Command(BaseCommand):
    help = 'Fix existing users who should be mentors but don\'t have MentorProfiles'

    def handle(self, *args, **options):
        self.stdout.write("Fixing existing mentors...")

        # Find all users with user_type='mentor' or 'mentoro' (typo)
        profiles_to_fix = UserProfile.objects.filter(user_type__in=['mentor', 'mentoro'])

        for profile in profiles_to_fix:
            user = profile.user
            
            # Fix typo
            if profile.user_type == 'mentoro':
                profile.user_type = 'mentor'
                profile.save()
                self.stdout.write(f"Fixed typo for {user.username}")
            
            # Create MentorProfile if missing
            if not MentorProfile.objects.filter(user=user).exists():
                MentorProfile.objects.create(
                    user=user,
                    hourly_rate=50.00,
                    experience_level='junior',
                    availability='Flexible',
                    is_active=True
                )
                self.stdout.write(f"Created MentorProfile for {user.username}")
            else:
                self.stdout.write(f"MentorProfile already exists for {user.username}")

        self.stdout.write(self.style.SUCCESS("Done!")) 