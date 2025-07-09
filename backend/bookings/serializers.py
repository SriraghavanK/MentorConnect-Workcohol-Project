from rest_framework import serializers
from .models import Booking
from users.serializers import UserSerializer
from mentors.serializers import MentorListSerializer
from decimal import Decimal

class BookingSerializer(serializers.ModelSerializer):
    mentee = UserSerializer(read_only=True)
    mentor = MentorListSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['mentee', 'total_amount', 'is_paid', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        return obj.mentee.id if obj.mentee else None
    
    def create(self, validated_data):
        mentee = self.context['request'].user
        validated_data['mentee'] = mentee
        # Calculate total amount based on mentor's hourly rate and duration
        mentor = validated_data['mentor']
        duration_hours = Decimal(validated_data['duration_minutes']) / Decimal(60)
        validated_data['total_amount'] = mentor.hourly_rate * duration_hours
        return super().create(validated_data)

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'mentor', 'session_type', 'session_date', 'session_time', 'duration_minutes', 'topic', 'description', 'total_amount', 'meeting_link', 'onsite_address']
    
    def create(self, validated_data):
        mentee = validated_data.pop('mentee')
        validated_data['mentee'] = mentee
        # Calculate total amount based on mentor's hourly rate and duration
        mentor = validated_data['mentor']
        duration_hours = Decimal(validated_data['duration_minutes']) / Decimal(60)
        validated_data['total_amount'] = mentor.hourly_rate * duration_hours
        
        # Generate Google Meet link for video calls
        if validated_data.get('session_type') == 'video_call':
            import uuid
            meeting_id = f"mentor-{uuid.uuid4().hex[:12]}"
            validated_data['meeting_link'] = f"https://meet.google.com/{meeting_id}"
        
        return super().create(validated_data) 