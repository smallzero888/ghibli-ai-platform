# Technology Stack

## Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Ghibli color palette
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query
- **Authentication**: Supabase Auth Helpers

## Backend
- **Framework**: FastAPI (Python)
- **Language**: Python 3.11+
- **Database**: PostgreSQL via Supabase
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT + Supabase integration
- **AI Services**: Replicate API, SiliconFlow API
- **Task Queue**: Celery + Redis
- **Image Processing**: Pillow

## Infrastructure
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (frontend), Railway/Render (backend)
- **Environment**: Environment variables via .env files

## Development Tools
- **Testing**: Jest (frontend), Playwright (E2E), Pytest (backend)
- **Linting**: ESLint, Black, isort
- **Package Management**: npm (frontend), pip (backend)

## Common Commands

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright tests
```

### Backend Development
```bash
# Setup
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python test_connection.py    # Test database connection
python run_migrations.py    # Run database migrations

# Testing
pytest                      # Run backend tests
```

### Database Operations
```bash
python backend/test_connection.py     # Test Supabase connection
python backend/run_migrations.py     # Apply database migrations
```

## Environment Variables
- Frontend: `.env.local` with NEXT_PUBLIC_ prefix for client-side
- Backend: `.env` file with database, AI service, and auth configurations
- Required: Supabase URL/keys, AI service API keys, JWT secrets