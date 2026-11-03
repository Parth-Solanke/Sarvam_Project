# 🛰️ OSINT Fusion Workbench

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Sarvam AI](https://img.shields.io/badge/Sarvam%20AI-sarvam--105b-orange.svg)](https://sarvam.ai)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1.svg?logo=neo4j&logoColor=white)](https://neo4j.com)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Ready-2496ED.svg?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An Intelligence Community (IC) grade **Open-Source Intelligence (OSINT) Fusion Workbench** engineered for cross-border investigative workflows, multi-source ingestion, and Indic multilingual translation. Built with **Sarvam AI**, a resilient hybrid **Knowledge Graph engine (Neo4j / NetworkX)**, **Weak-Signal Analytics**, and a **Human-in-the-Loop (HITL) Verification Workflow** with immutable audit logging.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites & Environment](#-prerequisites--environment)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Quick Sarvam API Check](#1-quick-sarvam-api-check)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Docker Infrastructure (Optional)](#4-docker-infrastructure-optional)
- [Seeded Data & Credentials](#-seeded-data--credentials)
- [API Reference](#-api-reference)
- [Verification & Automated Tests](#-verification--automated-tests)
- [Security & Compliance](#-security--compliance)

---

## 🌟 Key Features

### 1. 🇮🇳 Indic Multilingual Intelligence Processing
- **Script Identification & Translation**: Detects and translates intelligence across 10+ Indic scripts (Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam) into standard English.
- **Sarvam AI LLM Power**: Integrates `sarvam-105b-conversations` to execute linguistically nuanced intelligence translations while strictly preserving named entities, military acronyms, and geographical terminology.
- **Tamper-Evident Chunking**: Ingested sources are fingerprinted using SHA-256 with paragraph-bounded chunking that preserves strict character offsets (`char_offset_start`, `char_offset_end`) for end-to-end evidence drill-down.

### 2. 🧠 Entity & Relationship Extraction
- **Dual-Mode Extraction Engine**:
  - **Sarvam AI LLM Extraction**: Structures unformatted reports into normalized intelligence entities (`ORGANIZATION`, `PERSON`, `LOCATION`, `VESSEL`, `EVENT`) and directional relationships with verbatim source quotes.
  - **Deterministic Regex Fallback**: Automatic offline heuristics identifying maritime vessels, corporate entities, geographical straits, and chronological markers.

### 3. 🕸️ Traceable Knowledge Graph (Hybrid Engine)
- **Enterprise Neo4j & Embedded Fallback**: Connects directly to Neo4j graph clusters via Bolt protocol; automatically and seamlessly falls back to an embedded in-memory `networkx.MultiDiGraph` if external database instances are offline.
- **Interactive Visual Explorer**: Built with **Cytoscape.js** and the **CoSE-Bilkent** physics layout, featuring node color-coding, edge relation inspection, and verification status badges.

### 4. 📡 Weak-Signal & Anomaly Analytics
- **Pointwise Mutual Information (PMI)**: Uncovers anomalous entity co-occurrences that deviate from random configuration baselines (e.g., hidden shell companies associating with sanctioned vessels).
- **Broker & Hub Centrality**: Evaluates betweenness centrality to surface clandestine intermediaries acting as gatekeepers between distinct clusters.
- **Community Clustering**: Detects dense topological subgraphs via Louvain modularity to pinpoint covert networks.

### 5. 🛡️ Human-in-the-Loop (HITL) Verification & Audit Trail
- **Analyst Decision Queue**: Flagged entities and relationships require review (`APPROVED`, `REJECTED`, `DISPUTED`).
- **Immutable Audit Logging**: Every analyst determination, status shift, timestamp, IP address, and rationale is recorded in an immutable audit ledger (`AuditLog`).

### 6. 📄 Evidence-Backed Intelligence Briefings
- Automated synthesis of structured markdown intelligence reports complete with IC-format numbered citation anchors (`[1]`, `[2]`), confidence metrics, and verbatim evidence snippets.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph INGESTION["1. Multilingual Ingestion & Preprocessing"]
        A[Raw Sources: URLs, PDFs, Reports, Hindi/Indic Texts] --> B[Language Script Detection]
        B --> C[Sarvam AI Indic Translation Engine]
        C --> D[SHA-256 Hashing & Character Offset Chunking]
    end

    subgraph EXTRACTION["2. Intelligence Extraction"]
        D --> E[Sarvam AI sarvam-105b Extraction Engine]
        E -. Fallback .-> F[Heuristic / Regex Extractor]
        E --> G[Triplets: Entity -> Relation -> Entity]
    end

    subgraph KNOWLEDGE_GRAPH["3. Resilient Graph Storage"]
        G --> H{Neo4j Available?}
        H -- Yes --> I[(Neo4j Graph Database)]
        H -- No --> J[(Embedded NetworkX MultiDiGraph)]
    end

    subgraph ANALYTICS["4. Weak-Signal & Anomaly Engine"]
        I & J --> K[PMI Co-occurrence Scanner]
        I & J --> L[Betweenness Centrality & Broker Detector]
        I & J --> M[Louvain Dense Community Detection]
    end

    subgraph HITL["5. Verification & Governance"]
        K & L & M --> N[Analyst Verification Queue]
        N --> O[Human Analyst Review: Approve / Reject]
        O --> P[(Immutable Audit Log & SQL Database)]
        P --> Q[Synthesized Intelligence Reports with Citations]
    end
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org) (App Router), [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [Cytoscape.js](https://js.cytoscape.org), [Recharts](https://recharts.org), [Lucide React](https://lucide.dev) |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com), [Uvicorn](https://www.uvicorn.org), [Pydantic v2](https://docs.pydantic.dev), [SQLAlchemy 2.0 (Async)](https://www.sqlalchemy.org), [PyJWT](https://pyjwt.readthedocs.io) |
| **AI & NLP** | [Sarvam AI Python SDK](https://docs.sarvam.ai) (`sarvam-105b-conversations`), Custom Indic Unicode Lexical Parsers |
| **Knowledge Graph** | [Neo4j](https://neo4j.com) (Enterprise/Community with APOC), [NetworkX](https://networkx.org) (Embedded Resilient Fallback) |
| **Data & Storage** | PostgreSQL 16, SQLite (aiosqlite for local testing), Qdrant (Vector DB), MinIO (S3 compatible), Redis |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Repository Structure

```text
Sarvam_Project/
├── backend/                        # FastAPI Backend Application
│   ├── app/
│   │   ├── api/v1/                 # REST API Route Controllers
│   │   │   ├── auth.py             # Analyst login, token issuance, profile
│   │   │   ├── entities.py         # Entity catalog, search & resolution
│   │   │   ├── evidence.py         # Verbatim citation spans & chunk drill-down
│   │   │   ├── graph.py            # Graph endpoints & Cytoscape formatting
│   │   │   ├── reports.py          # Evidence-backed report generation
│   │   │   ├── router.py           # Master v1 API Router
│   │   │   ├── signals.py          # Anomaly & weak-signal feeds
│   │   │   ├── sources.py          # Multilingual ingestion & storage
│   │   │   └── verification.py     # HITL workflow & audit logging
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings & environment parsing
│   │   │   ├── database.py         # Async SQLAlchemy & Hybrid Graph Store
│   │   │   ├── security.py         # JWT tokens & password hashing (bcrypt)
│   │   │   └── seeder.py           # Initial analyst user & maritime intel seed
│   │   ├── models/
│   │   │   ├── schemas/schemas.py  # Pydantic input/output validation schemas
│   │   │   └── sql/models.py       # SQLAlchemy relational ORM models
│   │   ├── services/
│   │   │   ├── analytics/signals.py# PMI, broker centrality & cluster engine
│   │   │   ├── nlp/extractor.py    # Sarvam LLM & heuristic entity extraction
│   │   │   ├── nlp/multilingual.py # Indic script detection & translation
│   │   │   └── verification/workflow.py # HITL state transitions & audit log
│   │   └── main.py                 # FastAPI initialization, CORS, lifespan
│   └── requirements.txt            # Python dependencies
├── docker/
│   └── docker-compose.yml          # Postgres, Neo4j, Qdrant, MinIO, Redis
├── frontend/                       # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                    # Next.js App Router Pages
│   │   │   ├── page.tsx            # Executive Dashboard & Metrics
│   │   │   ├── ingestion/page.tsx  # Ingest Raw Text, URLs, Indic documents
│   │   │   ├── sources/page.tsx    # Source Repository & provenance
│   │   │   ├── entities/page.tsx   # Entity Catalog & alias resolution
│   │   │   ├── graph/page.tsx      # Cytoscape.js interactive graph explorer
│   │   │   ├── signals/page.tsx    # Weak-Signal anomaly feed & scores
│   │   │   ├── verification/page.tsx# HITL verification queue & audit log
│   │   │   ├── reports/page.tsx    # Automated brief generator with citations
│   │   │   └── layout.tsx          # Global layout & tactical workbench chrome
│   │   ├── components/             # Reusable UI widgets (Navbar, Sidebar)
│   │   └── lib/api.ts              # Typed API client interfacing with backend
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── tests/
│   ├── test_backend.py             # Standalone sanity test for DB, Graph & Signals
│   └── test_e2e_workflow.py        # End-to-end integration test (Ingest -> Verify -> Report)
├── main.py                         # Minimal Sarvam AI chat completion verification script
├── .env                            # Environment variables (git-ignored)
└── .gitignore
```

---

## 🔑 Prerequisites & Environment

### Prerequisites
- **Python**: `>= 3.10`
- **Node.js**: `>= 18.x` and **npm**
- **Docker & Docker Compose** (Optional, for full containerized backing services)
- **Sarvam AI API Key**: Obtainable from [Sarvam AI Portal](https://dashboard.sarvam.ai)

### Environment Configuration (`.env`)
Create a `.env` file in the root directory:

```env
# Sarvam AI Credentials
SARVAM_API_KEY=your_sarvam_api_key_here

# Or provide two keys for alternating round-robin usage:
# SARVAM_API_KEY1=first_key_here
# SARVAM_API_KEY2=second_key_here

# Security
JWT_SECRET_KEY=fusion-workbench-super-secure-jwt-key-2026

# Database (Defaults to SQLite if PostgreSQL is not active)
DATABASE_URL=sqlite+aiosqlite:///./osint_workbench.db
# PostgreSQL Alternative:
# DATABASE_URL=postgresql+asyncpg://analyst:fusion_secure_2026@localhost:5432/osint_workbench

# Neo4j Graph Database (Optional - falls back to embedded NetworkX)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=fusion_neo4j_2026
```

---

## 🚀 Quick Start Guide

### 1. Quick Sarvam API Check
Verify your Sarvam AI connection immediately with the root script:

```bash
python main.py
```
*Expected Output:*
```text
I am an AI assistant created by Sarvam, here to help you.
```

---

### 2. Backend Setup

```bash
# Navigate to project root
cd /path/to/Sarvam_Project

# Create and activate a virtual environment
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the backend server with auto-reload
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **System Health Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Workbench UI**: [http://localhost:3000](http://localhost:3000)

---

### 4. Docker Infrastructure (Optional)
To spin up the full backing service ecosystem (PostgreSQL, Neo4j, Qdrant, MinIO, Redis):

```bash
docker compose -f docker/docker-compose.yml up -d
```

| Service | Port | Credentials |
|---|---|---|
| **Neo4j Browser** | `http://localhost:7474` | `neo4j` / `fusion_neo4j_2026` |
| **PostgreSQL** | `localhost:5432` | `analyst` / `fusion_secure_2026` (`osint_workbench`) |
| **MinIO Console** | `http://localhost:9001` | `minioadmin` / `minioadmin_password` |
| **Qdrant Vector DB** | `http://localhost:6333` | - |
| **Redis** | `localhost:6379` | - |

---

## 👤 Seeded Data & Credentials

When the backend starts up, it automatically seeds an initial analyst account and baseline multi-source intelligence regarding a maritime shadow-fleet investigation:

- **Analyst Email**: `analyst@workbench.osint`
- **Analyst Password**: `osint_analyst_2026`
- **Seeded Scenarios**:
  - Suspicious Ship-to-Ship (STS) fuel transfers in the Gulf of Oman involving *MT Caspian Star* and *BlueWave Maritime Ltd*.
  - Hindi Customs Inspection report from Mumbai Port (*मुंबई बंदरगाह सीमा शुल्क निरीक्षण रिपोर्ट*) demonstrating multilingual Indic entity extraction.
  - Corporate beneficial ownership brief tracking intermediaries through *Apex Commercial Bank* in Singapore.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check backend, database, Neo4j, and Sarvam AI connection status |
| `POST` | `/api/v1/auth/login` | OAuth2 password login, returns JWT access token |
| `GET` | `/api/v1/auth/me` | Fetch active analyst profile & security role |
| `POST` | `/api/v1/sources/ingest` | Ingest new intelligence (URL, PDF, Raw Text, Indic documents) |
| `GET` | `/api/v1/sources` | List all ingested sources with SHA-256 fingerprint & language |
| `GET` | `/api/v1/entities` | Query extracted entities with resolution status and aliases |
| `GET` | `/api/v1/graph/subgraph` | Cytoscape-formatted node and edge representation of the graph |
| `GET` | `/api/v1/signals/active` | Retrieve detected weak-signals (PMI co-occurrences, broker hubs) |
| `GET` | `/api/v1/verification/queue` | Retrieve entities and relationships awaiting analyst review |
| `POST` | `/api/v1/verification/review` | Submit analyst determination (`APPROVED`, `REJECTED`, `DISPUTED`) |
| `GET` | `/api/v1/verification/audit-log` | View tamper-evident chronological audit log |
| `POST` | `/api/v1/reports/generate` | Synthesize an evidence-backed intelligence brief with citations |

---

## 🧪 Verification & Automated Tests

### Standalone Backend Verification
Executes database initialization, graph store connectivity, data seeding, and runs the weak-signal anomaly detection scan:

```bash
python tests/test_backend.py
```

### End-to-End Workflow Integration Test
Tests the full lifecycle with the backend server running (Ingestion $\to$ Graph Update $\to$ Verification Queue $\to$ Human Review $\to$ Audit Trail $\to$ Report Generation):

```bash
# Ensure backend server is running on port 8000
python tests/test_e2e_workflow.py
```

---

## 🔒 Security & Compliance

- **No Hardcoded Secrets**: All API keys, database credentials, and JWT signing keys are loaded strictly from the runtime environment or `.env`.
- **Zero API Key Leakage**: `.env` and local state files are excluded in `.gitignore`.
- **Immutable Provenance**: Every intelligence assertion links back to an exact character offset in the raw source document, providing rigorous chain-of-evidence for investigative integrity.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

