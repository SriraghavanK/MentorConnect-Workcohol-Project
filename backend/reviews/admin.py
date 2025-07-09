from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'mentor', 'rating', 'is_public', 'created_at')
    search_fields = ('mentee__username', 'mentor__user__username', 'comment')
    list_filter = ('rating', 'is_public', 'created_at')
