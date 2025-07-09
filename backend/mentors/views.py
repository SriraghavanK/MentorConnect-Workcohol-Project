from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import MentorProfile, Expertise
from .serializers import MentorProfileSerializer, ExpertiseSerializer

# Create your views here.

class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Show all mentors for debugging
        queryset = MentorProfile.objects.all()
        print(f"Total mentors in database: {queryset.count()}")
        for mentor in queryset:
            print(f"Mentor: {mentor.user.username}, Active: {mentor.is_active}, Verified: {mentor.is_verified}")
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print(f"Returning {len(serializer.data)} mentors")
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpertiseViewSet(viewsets.ModelViewSet):
    queryset = Expertise.objects.all()
    serializer_class = ExpertiseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
