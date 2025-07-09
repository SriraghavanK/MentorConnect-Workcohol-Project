from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer
from mentors.serializers import MentorListSerializer

class ReviewSerializer(serializers.ModelSerializer):
    mentee = UserSerializer(read_only=True)
    mentor = MentorListSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['mentee', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        mentee = self.context['request'].user
        validated_data['mentee'] = mentee
        return super().create(validated_data)

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['mentor', 'booking', 'rating', 'title', 'comment', 'is_public']
    
    def create(self, validated_data):
        mentee = self.context['request'].user
        validated_data['mentee'] = mentee
        return super().create(validated_data) 