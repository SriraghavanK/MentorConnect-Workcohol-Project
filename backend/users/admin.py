from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

# Register User model with custom admin
admin.site.unregister(User)  # Unregister default User admin
admin.site.register(User, UserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_type', 'phone_number', 'location', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number', 'location')
    list_filter = ('user_type', 'created_at')
