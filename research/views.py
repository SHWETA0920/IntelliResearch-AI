# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation
# from .serializers import (
#     ResearchSerializer, PaperSerializer, ConceptSerializer,
#     PrerequisiteSerializer, CitationSerializer, PaperConceptSerializer,
# )


# class ResearchViewSet(viewsets.ModelViewSet):
#     queryset = Research.objects.all().order_by("-created_at")
#     serializer_class = ResearchSerializer

#     @action(detail=True, methods=["post"])
#     def chat(self, request, pk=None):
#         """Placeholder chat endpoint. Replace this body with a call to the
#         teammate's RAG service once its contract is finalized."""
#         research = self.get_object()
#         question = request.data.get("message", "")

#         # TODO: replace with real call to teammate's RAG/AI service,
#         # passing research.id and question, returning their grounded answer.
#         answer = (
#             f"(placeholder) You asked about \"{question}\" regarding "
#             f"\"{research.topic}\". This will be answered by the AI "
#             f"research assistant once it's connected."
#         )

#         return Response({"answer": answer, "evidence": []})


# class PaperViewSet(viewsets.ModelViewSet):
#     queryset = Paper.objects.all()
#     serializer_class = PaperSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()
#         research_id = self.request.query_params.get("research")
#         if research_id:
#             qs = qs.filter(research_id=research_id)
#         return qs


# class ConceptViewSet(viewsets.ModelViewSet):
#     queryset = Concept.objects.all()
#     serializer_class = ConceptSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()
#         research_id = self.request.query_params.get("research")
#         if research_id:
#             qs = qs.filter(research_id=research_id)
#         return qs


# class PrerequisiteViewSet(viewsets.ModelViewSet):
#     queryset = Prerequisite.objects.all()
#     serializer_class = PrerequisiteSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()
#         research_id = self.request.query_params.get("research")
#         if research_id:
#             qs = qs.filter(paper__research_id=research_id)
#         return qs


# class CitationViewSet(viewsets.ModelViewSet):
#     queryset = Citation.objects.all()
#     serializer_class = CitationSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()
#         research_id = self.request.query_params.get("research")
#         if research_id:
#             qs = qs.filter(citing_paper__research_id=research_id)
#         return qs

# class PaperConceptViewSet(viewsets.ModelViewSet):
#     queryset = PaperConcept.objects.all()
#     serializer_class = PaperConceptSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()
#         research_id = self.request.query_params.get("research")
#         if research_id:
#             qs = qs.filter(paper__research_id=research_id)
#         return qs


# from rest_framework import viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response
# import traceback
# from .models import (
#     Research,
#     Paper,
#     Concept,
#     PaperConcept,
#     Prerequisite,
#     Citation,
# )

# from .serializers import (
#     ResearchSerializer,
#     PaperSerializer,
#     ConceptSerializer,
#     PrerequisiteSerializer,
#     CitationSerializer,
#     PaperConceptSerializer,
# )


# class ResearchViewSet(viewsets.ModelViewSet):
#     queryset = Research.objects.all().order_by("-created_at")
#     serializer_class = ResearchSerializer

#     @action(detail=True, methods=["post"])
#     def analyze(self, request, pk=None):
#         """
#         Trigger AI analysis for a research session.
#         """

#         research = self.get_object()

#         try:
#             # Import here so the rest of the backend can start normally
#             # even if the AI pipeline is still being developed.
#             from .services.pipeline import analyze_research

#             result = analyze_research(research)

#             return Response({
#                 "success": True,
#                 "research_id": research.id,
#                 "result": result,
#             })

#         # except Exception as exc:
#         #     return Response(
#         #         {
#         #             "success": False,
#         #             "research_id": research.id,
#         #             "error": str(exc),
#         #         },
#         #         status=500,
#         #     )

#         except Exception as exc:

#          traceback.print_exc()

#         return Response(
#         {
#             "success": False,
#             "research_id": research.id,
#             "error": str(exc),
#         },
#         status=500,
#     )

#     @action(detail=True, methods=["post"])
#     def chat(self, request, pk=None):
#         """Placeholder chat endpoint. Replace this body with the
#         teammate's RAG service once its contract is finalized."""

#         research = self.get_object()
#         question = request.data.get("message", "")

#         answer = (
#             f'(placeholder) You asked about "{question}" regarding '
#             f'"{research.topic}". This will be answered by the AI '
#             f"research assistant once it's connected."
#         )

#         return Response({
#             "answer": answer,
#             "evidence": [],
#         })


# class PaperViewSet(viewsets.ModelViewSet):
#     queryset = Paper.objects.all()
#     serializer_class = PaperSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()

#         research_id = self.request.query_params.get("research")

#         if research_id:
#             qs = qs.filter(research_id=research_id)

#         return qs


# class ConceptViewSet(viewsets.ModelViewSet):
#     queryset = Concept.objects.all()
#     serializer_class = ConceptSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()

#         research_id = self.request.query_params.get("research")

#         if research_id:
#             qs = qs.filter(research_id=research_id)

#         return qs


# class PrerequisiteViewSet(viewsets.ModelViewSet):
#     queryset = Prerequisite.objects.all()
#     serializer_class = PrerequisiteSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()

#         research_id = self.request.query_params.get("research")

#         if research_id:
#             qs = qs.filter(paper__research_id=research_id)

#         return qs


# class CitationViewSet(viewsets.ModelViewSet):
#     queryset = Citation.objects.all()
#     serializer_class = CitationSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()

#         research_id = self.request.query_params.get("research")

#         if research_id:
#             qs = qs.filter(citing_paper__research_id=research_id)

#         return qs


# class PaperConceptViewSet(viewsets.ModelViewSet):
#     queryset = PaperConcept.objects.all()
#     serializer_class = PaperConceptSerializer

#     def get_queryset(self):
#         qs = super().get_queryset()

#         research_id = self.request.query_params.get("research")

#         if research_id:
#             qs = qs.filter(paper__research_id=research_id)

#         return qs

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

        research = self.get_object()

        try:
            # Import here so Django only loads the pipeline when
            # the analyze endpoint is actually called.
            from .services.pipeline import analyze_research

            # Make sure the research has papers
            papers = research.papers.all()

            if not papers.exists():
                return Response(
                    {
                        "success": False,
                        "research_id": research.id,
                        "error": "No papers have been uploaded for this research.",
                    },
                    status=400,
                )

            # Mark research as currently being analyzed
            research.status = "analyzing"
            research.save(update_fields=["status"])

            # Run the analysis pipeline
            result = analyze_research(research)

            # Mark as ready after successful analysis
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
            # Print the complete traceback in the Django terminal
            # so we can see the actual backend error.
            traceback.print_exc()

            # Mark research as failed
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
        Placeholder chat endpoint.
        Replace the body with the actual RAG/AI service later.
        """

        research = self.get_object()

        question = request.data.get("message", "")

        answer = (
            f'(placeholder) You asked about "{question}" regarding '
            f'"{research.topic}". This will be answered by the AI '
            f"research assistant once it's connected."
        )

        return Response(
            {
                "answer": answer,
                "evidence": [],
            }
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