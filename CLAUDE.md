# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Duodushu Desktop** (多读书桌面版) is an immersive English learning workstation built as a desktop application using:
- **Electron** - Desktop shell and process management
- **Next.js 16** - Frontend UI (React 19, static export mode)
- **Python FastAPI** - Backend services for document processing, TTS, AI, and dictionary lookup

The application supports PDF/EPUB/TXT reading, three-tier dictionary lookup (Cache->Local->AI), FTS5 full-text search with AI Q&A, and TTS voice synthesis.

## Architecture

This is a **three-process desktop application**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│                  (electron/main.ts)                          │
│  - Spawns Python backend (port 8000)                        │
│  - Creates BrowserWindow with preload script                │
│  - Loads Next.js app (dev: localhost:3000, prod: static)    │
│  - Manages portable data directory paths                   │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────┐      ┌──────────────────────────────────┐
│  Python Backend     │      │     Next.js Frontend             │
│  (FastAPI)          │◄────►│  (Static Export)                  │
│  Port: 8000         │ HTTP │  - No server-side routing        │
│                    │      │  - All API calls to :8000         │
│  - Book processing  │      │  - PDF/EPUB/TXT readers           │
│  - TTS/AI services  │      │  - Dictionary lookup              │
│  - Vocabulary mgmt  │      │                                  │
└─────────────────────┘      └──────────────────────────────────┘
```

### Key Difference from Web Apps
- Next.js uses `output: 'export'` - purely static files, no API routes
- Python backend runs as separate child process (spawned by Electron)
- Frontend communicates via HTTP to `localhost:8000` (configurable)

## Development Commands

```bash
# Install dependencies
npm install                           # Root dependencies (Electron, build tools)
cd frontend && npm install            # Frontend dependencies
cd backend && pip install -r requirements.txt  # Backend dependencies

# Development mode (runs all three processes)
npm run dev                           # Starts frontend + Electron in parallel

# Individual development
cd frontend && npm run dev            # Frontend only (port 3000)
cd backend && python -m uvicorn app.main:app --reload  # Backend only (port 8000)

# Building
npm run build                         # Full build: frontend → backend → electron → package
npm run build:frontend                # Build frontend to frontend/out
npm run build:backend                 # Build backend with PyInstaller to backend/dist/backend
npm run build:electron                # Compile Electron TypeScript
npm run package                       # Package with electron-builder → dist_app/

# Testing
cd backend && pytest                  # Run all tests
cd backend && pytest tests/test_vocabulary.py  # Run specific test

# Linting
cd frontend && npm run lint           # ESLint check
```

## Important File Locations

| Purpose | Path |
|---------|------|
| **Electron entry** | `electron/main.ts` - Spawns backend, creates window, manages portable mode |
| **Frontend entry** | `frontend/src/app/page.tsx` - Home page (bookshelf) |
| **Backend entry** | `backend/app/main.py` - FastAPI app initialization |
| **Backend runner** | `backend/run_backend.py` - CLI entry with `--port` and `--data-dir` args |
| **Build config** | `package.json` - Electron Builder config, build scripts |
| **Frontend config** | `frontend/next.config.ts` - Static export mode (`output: 'export'`) |
| **PyInstaller spec** | `backend/backend.spec` - Python packaging configuration |
| **API client** | `frontend/src/lib/api.ts` - Frontend API wrapper (points to localhost:8000) |

## Data Storage (Portable Mode)

The app supports **portable mode** where data travels with the executable:

```
Duodushu/
├── Duodushu.exe
├── resources/
└── data/              ← Portable data directory (created next to exe)
    ├── app.db         (SQLite database)
    ├── uploads/       (User uploaded files)
    └── dicts/         (Imported dictionaries)
```

**Data path resolution** (in `electron/main.ts`):
1. Check for portable `data/` folder next to exe
2. If found, use portable mode
3. Otherwise, use system `userData` directory
4. In development, use `backend/data`

Backend data path is passed via `--data-dir` argument when spawning the Python process.

## Backend Architecture

**FastAPI** with SQLAlchemy 2.0 Async, following Router → Service → Model pattern:

- **Routers** (`backend/app/routers/`): Thin layer for validation/serialization (< 20 lines)
- **Services** (`backend/app/services/`): Business logic (thick layer)
- **Models** (`backend/app/models/`): SQLAlchemy ORM
- **Parsers** (`backend/app/parsers/`): Document parsing (Factory pattern for PDF/EPUB/TXT)

**Key conventions**:
- Use `pathlib.Path` instead of `os.path`
- Use `Depends(get_db)` for database sessions (no manual `db.close()`)
- Use `BackgroundTasks` for long-running operations (AI, parsing)
- API parameters use **snake_case** (Pydantic models)

## Frontend Architecture

**Next.js 16** with App Router, React 19, Tailwind CSS 4:

- **App Router** (`frontend/src/app/`): Pages and layouts
- **Components** (`frontend/src/components/`): UI components (readers, AI sidebar)
- **Lib** (`frontend/src/lib/`): API client, utilities
- **Hooks**: Zustand for state management (avoid prop drilling)

**Key conventions**:
- All API requests go through `lib/api.ts` (proxies to localhost:8000)
- Use `lib/logger.ts` for logging (not `console.log`)
- API request bodies must use **snake_case** (e.g., `page_content: pageContent`)
- No server-side routing - purely static export

## Language

**Always use Simplified Chinese (简体中文)** for code comments, documentation, and user-facing text unless explicitly requested otherwise.

## Common Tasks

- **Add new API endpoint**: Create Pydantic model in `backend/app/routers/`, add service method, update `frontend/src/lib/api.ts`
- **Add new page**: Add to `frontend/src/app/` (Next.js App Router)
- **Modify build output**: Edit `package.json` (Electron Builder config) or `frontend/next.config.ts`
- **Change data directory**: Modify `electron/main.ts` (portable mode detection) and backend config
- **Debug backend**: Check logs from spawned Python process or run `backend/run_backend.py` directly
- **Debug frontend**: Use React DevTools, check `electron/main.ts` for dev URL configuration
