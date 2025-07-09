from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Sum
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all() # type: ignore
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile unless admin
        user = self.request.user
        if user.is_superuser:
            return UserProfile.objects.all() # type: ignore 
        return UserProfile.objects.filter(user=user) # type: ignore

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile info"""
        profile = self.get_queryset().first()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics for dashboard"""
        user = request.user
        
        # Import here to avoid circular imports
        from bookings.models import Booking
        from reviews.models import Review
        
        # Get user's bookings
        if hasattr(user, 'profile') and user.profile.user_type == 'mentor':
            # For mentors, filter by mentor field (MentorProfile instance)
            user_bookings = Booking.objects.filter(mentor=user.profile) # type: ignore
        else:
            # For mentees, filter by mentee field
            user_bookings = Booking.objects.filter(mentee=user) # type: ignore
        
        # Calculate stats based on user type
        if hasattr(user, 'profile') and user.profile.user_type == 'mentor':
            # Mentor stats
            total_sessions = user_bookings.count()
            upcoming_sessions = user_bookings.filter(status='confirmed').count()
            
            # Calculate earnings using actual booking total_amount, treat None as 0, and add debug logging
            completed_sessions = user_bookings.filter(status='completed')
            total_amounts = [float(getattr(booking, 'total_amount', 0) or 0) for booking in completed_sessions]
            print('Mentor earnings calculation, total_amounts:', total_amounts)
            total_earnings = sum(total_amounts)
            
            # Get average rating
            mentor_reviews = Review.objects.filter(mentor=user.profile) # type: ignore
            average_rating = mentor_reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            
            stats = {
                'total_sessions': total_sessions,
                'upcoming_sessions': upcoming_sessions,
                'total_earnings': round(total_earnings, 2),
                'average_rating': round(average_rating, 1),
                'total_reviews': mentor_reviews.count()
            }
        else:
            # Mentee stats
            total_sessions = user_bookings.count()
            upcoming_sessions = user_bookings.filter(status='confirmed').count()
            
            # Calculate total hours
            completed_sessions = user_bookings.filter(status='completed')
            total_hours = sum(booking.duration_minutes / 60 for booking in completed_sessions)
            
            # Get unique mentors
            unique_mentors = user_bookings.values('mentor').distinct().count()
            
            stats = {
                'total_sessions': total_sessions,
                'upcoming_sessions': upcoming_sessions,
                'total_hours': round(total_hours, 1),
                'unique_mentors': unique_mentors
            }
        
        return Response(stats)

class UserRegistrationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        print(f"Registration request data: {request.data}")  # Debug log
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"User created: {user.username}, Profile user_type: {user.profile.user_type}")  # Debug log
            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        print(f"Registration errors: {serializer.errors}")  # Debug log
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
