from ..models import Research


def analyze_research(research):
    """
    Basic research analysis pipeline.

    This currently validates that the research has uploaded papers
    and prepares the research for later analysis logic.
    """

    if not isinstance(research, Research):
        raise ValueError("Invalid research object.")

    papers = research.papers.all()

    if not papers.exists():
        raise ValueError("No papers were uploaded for this research.")

    # The actual PDF/AI analysis can be added here later.
    # For now, the uploaded papers remain associated with the research.

    return {
        "research_id": research.id,
        "papers_processed": papers.count(),
    }