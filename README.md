# IntelliResearch

**IntelliResearch** is an AI-powered research assistant that turns a pile of academic PDFs into a structured, navigable research workspace. Upload a set of papers on a topic, and IntelliResearch extracts key points, maps prerequisite relationships between papers, builds a citation graph, and gives you a chat assistant that answers questions **grounded strictly in your uploaded papers** — not general internet knowledge.

---

## ✨ Features

- **Paper Analysis** — Extracts text from each uploaded PDF and generates:
  - A concise list of key points per paper
  - A structured *deep analysis* (Problem, Method, Datasets, Key Findings, Limitations, Novelty, Future Work)
- **Learning Path** — Automatically orders papers by prerequisite dependency, so you know which paper to read first and why.
- **Citation Graph** — Detects and visualizes citation relationships between the papers in your set.
- **RAG-Powered Chat Assistant** — Ask natural-language questions about your papers. Answers are retrieved via a vector search (ChromaDB) over your paper embeddings, then grounded and generated through an LLM — the assistant explicitly declines to answer from outside knowledge.
- **PDF Export** — Download Learning Path, Citations, and Paper Analysis as printable PDFs.
- **Bring Your Own API Key** — Optionally use your own LLM provider/API key from the AI Assistant panel instead of the app's default.
- **Full research dashboard** — Sidebar navigation, live stats (papers analyzed, concepts identified, reading progress), and a polished glass-morphism UI.

---

## 🏗️ Architecture

```
User uploads PDFs
      │
      ▼
pdf_extractor.py  ──► raw text per paper
      │
      ▼
chunking.py       ──► splits text into embeddable chunks
      │
      ▼
embeddings.py     ──► generates vector embeddings
      │
      ▼
vector_store.py   ──► stores/queries vectors in ChromaDB (chroma_store/)
      │
      ├──► rag_paper_analysis.py / deep_paper_analysis.py
      │        → key points + structured 7-field deep analysis per paper
      │
      └──► rag_retriever.py + chat_service.py + llm_client.py
               → retrieves relevant chunks for a user question,
                 sends them to the LLM, returns a grounded answer

pipeline.py orchestrates the end-to-end flow triggered on
POST /api/research/<id>/analyze/
```

---

## 🧰 Tech Stack

**Backend**
- Django + Django REST Framework
- SQLite (default dev database)
- ChromaDB (vector store for embeddings/RAG)
- Groq / any OpenAI-compatible LLM API (configurable)

**Frontend**
- React (Vite)
- React Router
- Plain CSS (custom glass-morphism theme, no UI framework dependency)

---

## 📁 Project Structure

```
IntelliResearch/
├── chroma_store/                  # Persisted vector store data
├── config/                        # Django project settings
├── frontend/                      # React (Vite) application
│   └── src/
│       ├── api/
│       │   └── client.js          # Centralized API client
│       ├── assets/
│       ├── components/
│       │   ├── ArcCarousel.jsx
│       │   ├── ChatWidget.jsx
│       │   ├── LearningPath.jsx
│       │   ├── Navbar.jsx
│       │   └── Reveal.jsx
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── AIAssistant.jsx
│       │   ├── Contact.jsx
│       │   ├── Home.jsx
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── PaperAnalysisPage.jsx
│       │   ├── PaperExplorer.jsx
│       │   ├── ResearchSetup.jsx
│       │   └── ResearchWorkspace.jsx
│       └── styles/
│           ├── AIAssistant.css
│           ├── LearningPath.css
│           ├── ResearchWorkspace.css
│           └── theme.css
├── research/                      # Django app: core domain logic
│   ├── migrations/
│   ├── services/
│   │   ├── chat_service.py        # RAG-grounded chat responses
│   │   ├── chunking.py            # Text chunking for embeddings
│   │   ├── deep_paper_analysis.py # 7-field structured paper analysis
│   │   ├── embeddings.py          # Embedding generation
│   │   ├── llm_client.py          # LLM API wrapper
│   │   ├── pdf_extractor.py       # PDF → text extraction
│   │   ├── pipeline.py            # End-to-end analysis orchestration
│   │   ├── rag_paper_analysis.py  # Key-point extraction via RAG
│   │   ├── rag_retriever.py       # Vector similarity retrieval
│   │   └── vector_store.py        # ChromaDB read/write interface
│   ├── models.py                  # Research, Paper, Concept, Prerequisite, Citation
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── .env                           # Environment variables (not committed)
├── db.sqlite3
├── manage.py
├── requirements.txt
└── verify.py
```

---

## ⚙️ Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- An API key from an OpenAI-compatible LLM provider (e.g. [Groq](https://console.groq.com/keys))

### 1. Backend

```bash
# from the project root
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in the project root (same folder as `manage.py`):

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=your-model-name
LLM_API_KEY=your-api-key-here
```

Apply migrations and start the server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/api/research/` | List / create research sessions |
| `GET` | `/api/research/<id>/` | Get a single research session |
| `POST` | `/api/research/<id>/analyze/` | Trigger the analysis pipeline |
| `POST` | `/api/research/<id>/chat/` | Ask the RAG-grounded assistant a question |
| `GET` / `POST` | `/api/papers/` | List / upload papers |
| `GET` | `/api/concepts/` | List extracted concepts |
| `GET` | `/api/prerequisites/` | List prerequisite relationships |
| `GET` | `/api/citations/` | List citation relationships |
| `GET` | `/api/paper-concepts/` | List paper-to-concept links |

---

## 🗺️ Roadmap / Ideas

- Background task queue (Celery) for long-running analysis instead of synchronous processing
- Multi-user accounts with saved research history
- Support for additional document formats (DOCX, HTML)

---

## 📄 License

This project is provided as-is for educational/personal use. Add a license of your choice (MIT, Apache 2.0, etc.) here before distributing publicly.

---

## 🙌 Contributors

- Core application, backend pipeline, and dashboard UI
- Learning Path & Citations feature contributions

*(Replace with actual names/links.)*
