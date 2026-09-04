import traceback

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Research,
    Paper,
    Concept,
    PaperConcept,
    Prerequisite,
    Citation,
)

from .serializers import (
    ResearchSerializer,
    PaperSerializer,
    ConceptSerializer,
    PrerequisiteSerializer,
    CitationSerializer,
    PaperConceptSerializer,
)


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all().order_by("-created_at")
    serializer_class = ResearchSerializer

    @action(detail=True, methods=["post"])
    def analyze(self, request, pk=None):
        """
        Analyze all papers belonging to a research session.
        """

        try:
            # Get research object
            research = self.get_object()

            # Get all papers belonging to this research
            papers = research.papers.all()

            # Check whether papers exist
            if not papers.exists():
                return Response(
                    {
                        "success": False,
                        "research_id": research.id,
                        "status": research.status,
                        "error": "No papers have been uploaded for this research.",
                    },
                    status=400,
                )

            # Mark research as analyzing
            research.status = "analyzing"
            research.save(update_fields=["status"])

            # Import pipeline here
            from .services.pipeline import analyze_research

            # Run analysis
            result = analyze_research(research)

            # Mark research as ready
            research.status = "ready"
            research.save(update_fields=["status"])

            return Response(
                {
                    "success": True,
                    "research_id": research.id,
                    "status": research.status,
                    "result": result,
                },
                status=200,
            )

        except Exception as exc:
            # Print complete error in Django terminal
            traceback.print_exc()

            # Try to mark research as failed
            try:
                research.status = "failed"
                research.save(update_fields=["status"])
            except Exception:
                pass

            return Response(
                {
                    "success": False,
                    "research_id": getattr(research, "id", pk),
                    "status": "failed",
                    "error": str(exc),
                    "error_type": type(exc).__name__,
                },
                status=500,
            )

    @action(detail=True, methods=["post"])
    def chat(self, request, pk=None):
        """
        Chat endpoint for a research session — RAG-grounded, answers only
        from papers that have been analyzed (and therefore indexed) in
        this research session.
        """

        research = self.get_object()

        question = request.data.get("message", "")

        if not question or not question.strip():
            return Response(
                {
                    "answer": "Please ask a question about your research papers.",
                    "evidence": [],
                },
                status=400,
            )

        try:
            from .services.chat_service import answer_question

            result = answer_question(research.id, question)

            return Response(result, status=200)

        except Exception as exc:
            traceback.print_exc()

            return Response(
                {
                    "answer": (
                        "Sorry, something went wrong answering that question. "
                        "Please try again in a moment."
                    ),
                    "evidence": [],
                    "error": str(exc),
                },
                status=500,
            )


class PaperViewSet(viewsets.ModelViewSet):
    queryset = Paper.objects.all()
    serializer_class = PaperSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(research_id=research_id)

        return qs


class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(research_id=research_id)

        return qs


class PrerequisiteViewSet(viewsets.ModelViewSet):
    queryset = Prerequisite.objects.all()
    serializer_class = PrerequisiteSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(paper__research_id=research_id)

        return qs


class CitationViewSet(viewsets.ModelViewSet):
    queryset = Citation.objects.all()
    serializer_class = CitationSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(citing_paper__research_id=research_id)

        return qs


class PaperConceptViewSet(viewsets.ModelViewSet):
    queryset = PaperConcept.objects.all()
    serializer_class = PaperConceptSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(paper__research_id=research_id)

        return qs