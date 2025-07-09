from django.contrib import admin
from .models import MentorProfile, Expertise

@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'experience_level', 'hourly_rate', 'is_verified', 'is_active', 'created_at')
    search_fields = ('user__username', 'company', 'position')
    list_filter = ('experience_level', 'is_verified', 'is_active')

@admin.register(Expertise)
class ExpertiseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
