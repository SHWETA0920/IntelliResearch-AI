# from django.db import models


# class Research(models.Model):
#     """One 'research session' — a topic + a set of uploaded papers."""

#     STATUS_CHOICES = [
#         ("pending", "Pending"),
#         ("analyzing", "Analyzing"),
#         ("ready", "Ready"),
#         ("failed", "Failed"),
#     ]

#     topic = models.CharField(max_length=255)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.topic


# # class Paper(models.Model):
# #     """One uploaded PDF, belonging to a Research session."""

# #     research = models.ForeignKey(Research, related_name="papers", on_delete=models.CASCADE)
# #     file = models.FileField(upload_to="papers/")
# #     title = models.CharField(max_length=500, blank=True)
# #     authors = models.CharField(max_length=500, blank=True)
# #     year = models.IntegerField(null=True, blank=True)
# #     abstract = models.TextField(blank=True)
# #     order_position = models.IntegerField(null=True, blank=True)
# #     ai_summary = models.TextField(blank=True)
# #     raw_ai_data = models.JSONField(default=dict, blank=True)

# class Paper(models.Model):
#     research = models.ForeignKey(
#         Research,
#         related_name="papers",
#         on_delete=models.CASCADE
#     )

#     file = models.FileField(upload_to="papers/")

#     title = models.CharField(max_length=500, blank=True)
#     authors = models.CharField(max_length=500, blank=True)
#     year = models.IntegerField(null=True, blank=True)
#     abstract = models.TextField(blank=True)

#     text = models.TextField(blank=True)

#     order_position = models.IntegerField(null=True, blank=True)

#     ai_summary = models.TextField(blank=True)
#     raw_ai_data = models.JSONField(default=dict, blank=True)

#     def __str__(self):
#         return self.title or self.file.name


# class Concept(models.Model):
#     """A single idea/topic, e.g. 'Recursion', scoped to one Research session."""

#     research = models.ForeignKey(Research, related_name="concepts", on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)

#     def __str__(self):
#         return self.name


# class PaperConcept(models.Model):
#     """Links a Paper to a Concept, and says whether the paper introduces it
#     or requires it as background knowledge."""

#     ROLE_CHOICES = [
#         ("introduces", "Introduces"),
#         ("requires", "Requires"),
#     ]

#     paper = models.ForeignKey(Paper, related_name="paper_concepts", on_delete=models.CASCADE)
#     concept = models.ForeignKey(Concept, related_name="paper_concepts", on_delete=models.CASCADE)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES)

#     class Meta:
#         unique_together = ("paper", "concept", "role")


# class Prerequisite(models.Model):
#     """An edge: `paper` requires `prerequisite_paper` to be read first."""

#     paper = models.ForeignKey(Paper, related_name="prerequisites", on_delete=models.CASCADE)
#     prerequisite_paper = models.ForeignKey(Paper, related_name="required_by", on_delete=models.CASCADE)
#     reason = models.TextField(blank=True)
#     confidence = models.FloatField(null=True, blank=True)

#     class Meta:
#         unique_together = ("paper", "prerequisite_paper")

#     def __str__(self):
#         return f"{self.prerequisite_paper} -> {self.paper}"


# class Citation(models.Model):
#     """An edge: `citing_paper` cites `cited_paper`."""

#     citing_paper = models.ForeignKey(Paper, related_name="citations_made", on_delete=models.CASCADE)
#     cited_paper = models.ForeignKey(Paper, related_name="citations_received", on_delete=models.CASCADE)

#     class Meta:
#         unique_together = ("citing_paper", "cited_paper")

#     def __str__(self):
#         return f"{self.citing_paper} cites {self.cited_paper}"

from django.db import models


class Research(models.Model):
    """One 'research session' — a topic + a set of uploaded papers."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("analyzing", "Analyzing"),
        ("ready", "Ready"),
        ("failed", "Failed"),
    ]

    topic = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic


class Paper(models.Model):
    """One uploaded PDF, belonging to a Research session."""

    research = models.ForeignKey(Research, related_name="papers", on_delete=models.CASCADE)
    file = models.FileField(upload_to="papers/")
    title = models.CharField(max_length=500, blank=True)
    authors = models.CharField(max_length=500, blank=True)
    year = models.IntegerField(null=True, blank=True)
    abstract = models.TextField(blank=True)
    # NEW: caches the full extracted PDF text, so it only needs to be
    # parsed once per paper (during analyze) instead of every time some
    # feature needs the raw text — key_points, deep_analysis, citation
    # detection, and chat indexing can all now read this instead of
    # each re-running pdfplumber themselves.
    text = models.TextField(blank=True)
    order_position = models.IntegerField(null=True, blank=True)
    ai_summary = models.TextField(blank=True)
    raw_ai_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.title or self.file.name


class Concept(models.Model):
    """A single idea/topic, e.g. 'Recursion', scoped to one Research session."""

    research = models.ForeignKey(Research, related_name="concepts", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class PaperConcept(models.Model):
    """Links a Paper to a Concept, and says whether the paper introduces it
    or requires it as background knowledge."""

    ROLE_CHOICES = [
        ("introduces", "Introduces"),
        ("requires", "Requires"),
    ]

    paper = models.ForeignKey(Paper, related_name="paper_concepts", on_delete=models.CASCADE)
    concept = models.ForeignKey(Concept, related_name="paper_concepts", on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ("paper", "concept", "role")


class Prerequisite(models.Model):
    """An edge: `paper` requires `prerequisite_paper` to be read first."""

    paper = models.ForeignKey(Paper, related_name="prerequisites", on_delete=models.CASCADE)
    prerequisite_paper = models.ForeignKey(Paper, related_name="required_by", on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    confidence = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("paper", "prerequisite_paper")

    def __str__(self):
        return f"{self.prerequisite_paper} -> {self.paper}"


class Citation(models.Model):
    """An edge: `citing_paper` cites `cited_paper`."""

    citing_paper = models.ForeignKey(Paper, related_name="citations_made", on_delete=models.CASCADE)
    cited_paper = models.ForeignKey(Paper, related_name="citations_received", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("citing_paper", "cited_paper")

    def __str__(self):
        return f"{self.citing_paper} cites {self.cited_paper}"