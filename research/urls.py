
from rest_framework.routers import DefaultRouter

from .views import (
    ResearchViewSet,
    PaperViewSet,
    ConceptViewSet,
    PrerequisiteViewSet,
    CitationViewSet,
    PaperConceptViewSet,
)


router = DefaultRouter()

router.register("research", ResearchViewSet)
router.register("papers", PaperViewSet)
router.register("concepts", ConceptViewSet)
router.register("prerequisites", PrerequisiteViewSet)
router.register("citations", CitationViewSet)
router.register("paper-concepts", PaperConceptViewSet)

urlpatterns = router.urls

