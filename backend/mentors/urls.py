from rest_framework.routers import DefaultRouter
from .views import MentorProfileViewSet, ExpertiseViewSet

router = DefaultRouter()
router.register(r'expertise', ExpertiseViewSet, basename='expertise')
router.register(r'', MentorProfileViewSet, basename='mentorprofile')

urlpatterns = router.urls 