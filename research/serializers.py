# from rest_framework import serializers
# from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation



# class PaperSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Paper
#         fields = [
#             "id", "research", "file", "title", "authors", "year",
#             "abstract", "order_position", "ai_summary", "raw_ai_data",
#         ]


# class ConceptSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Concept
#         fields = ["id", "research", "name"]


# class PrerequisiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Prerequisite
#         fields = ["id", "paper", "prerequisite_paper", "reason", "confidence"]


# class CitationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Citation
#         fields = ["id", "citing_paper", "cited_paper"]


# class ResearchSerializer(serializers.ModelSerializer):
#     papers = PaperSerializer(many=True, read_only=True)

#     class Meta:
#         model = Research
#         fields = ["id", "topic", "status", "created_at", "papers"]

# class PaperConceptSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PaperConcept
#         fields = ["id", "paper", "concept", "role"]
# class AnalyzeSerializer(serializers.Serializer):
#     """
#     Analyze endpoint does not require any request data.
#     """
#     pass

from rest_framework import serializers
from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation


class PaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paper
        fields = [
            "id", "research", "file", "title", "authors", "year",
            "abstract", "order_position", "ai_summary", "raw_ai_data",
        ]
        # NOTE: deliberately NOT including "text" here. It's the full
        # extracted PDF text (can be tens of KB per paper) — exposing it
        # on every list/detail API call would bloat every response that
        # touches papers. If a future feature genuinely needs the raw
        # text over the API, add a dedicated endpoint/field for it rather
        # than including it here by default.


class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ["id", "research", "name"]


class PrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prerequisite
        fields = ["id", "paper", "prerequisite_paper", "reason", "confidence"]


class CitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Citation
        fields = ["id", "citing_paper", "cited_paper"]


class ResearchSerializer(serializers.ModelSerializer):
    papers = PaperSerializer(many=True, read_only=True)

    class Meta:
        model = Research
        fields = ["id", "topic", "status", "created_at", "papers"]


class PaperConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperConcept
        fields = ["id", "paper", "concept", "role"]


class AnalyzeSerializer(serializers.Serializer):
    """
    Analyze endpoint does not require any request data.
    """
    pass