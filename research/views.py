import traceback

from rest_framework import viewsets, serializers
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
    AnalyzeSerializer,
)


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all().order_by("-created_at")
    serializer_class = ResearchSerializer

    @action(
        detail=True,
        methods=["post"],
        serializer_class=AnalyzeSerializer,
    )
    def analyze(self, request, pk=None):
        """
        Analyze all papers belonging to a research session.

        Runs BOTH: citation/prerequisite detection (rule-based) and
        LLM-based key-point/deep-analysis/chat-indexing — combined into
        one call to research.services.pipeline.analyze_research().
        research.status transitions are owned entirely here, not inside
        the pipeline, so there's a single source of truth for status.
        """

        research = self.get_object()

        try:
            from .services.pipeline import analyze_research

            papers = research.papers.all()

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

            research.status = "analyzing"
            research.save(update_fields=["status"])

            result = analyze_research(research)

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
            traceback.print_exc()

            research.status = "failed"
            research.save(update_fields=["status"])

            return Response(
                {
                    "success": False,
                    "research_id": research.id,
                    "status": research.status,
                    "error": str(exc),
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

    def perform_create(self, serializer):
        citing_paper = serializer.validated_data["citing_paper"]
        cited_paper = serializer.validated_data["cited_paper"]

        if citing_paper.research_id != cited_paper.research_id:
            raise serializers.ValidationError(
                "Both papers must belong to the same research session."
            )

        serializer.save()


class PaperConceptViewSet(viewsets.ModelViewSet):
    queryset = PaperConcept.objects.all()
    serializer_class = PaperConceptSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        research_id = self.request.query_params.get("research")

        if research_id:
            qs = qs.filter(paper__research_id=research_id)

        return qs