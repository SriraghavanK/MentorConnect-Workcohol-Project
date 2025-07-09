from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('mentee', 'mentor', 'session_type', 'session_date', 'session_time', 'status', 'is_paid')
    search_fields = ('mentee__username', 'mentor__user__username', 'topic')
    list_filter = ('status', 'session_type', 'is_paid', 'session_date')
