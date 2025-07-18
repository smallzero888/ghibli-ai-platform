# Project Structure

## Root Directory
```
ghibli-ai-platform/
├── src/                    # Frontend source code
├── backend/               # Backend API source code
├── .kiro/                 # Kiro configuration and specs
├── .env.local.example     # Environment template
└── package.json           # Frontend dependencies
```

## Frontend Structure (`src/`)
```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth route group
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── dashboard/        # User dashboard
│   ├── gallery/          # Image gallery
│   ├── generate/         # Generation interface
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── generate/        # Generation-specific components
│   ├── home/            # Homepage components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── api.ts           # API client
│   ├── supabase.ts      # Supabase client
│   ├── utils.ts         # General utilities
│   └── validations.ts   # Zod schemas
├── stores/              # Zustand state stores
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## Backend Structure (`backend/`)
```
backend/
├── app/
│   ├── api/             # API route handlers
│   │   ├── auth.py      # Authentication endpoints
│   │   ├── generate.py  # Generation endpoints
│   │   ├── images.py    # Image management
│   │   └── users.py     # User management
│   ├── core/            # Core functionality
│   │   ├── config.py    # Configuration settings
│   │   ├── database.py  # Database connection
│   │   ├── auth.py      # Auth utilities
│   │   └── security.py  # Security utilities
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── services/        # Business logic services
│       ├── replicate_service.py
│       └── siliconflow_service.py
├── migrations/          # Database migrations
├── main.py             # FastAPI application entry
└── requirements.txt    # Python dependencies
```

## Naming Conventions

### Files and Directories
- **Frontend**: kebab-case for files (`generation-form.tsx`)
- **Backend**: snake_case for Python files (`replicate_service.py`)
- **Components**: PascalCase for React components
- **Pages**: lowercase for Next.js routes

### Code Conventions
- **React Components**: PascalCase (`GenerationForm`)
- **Functions/Variables**: camelCase (frontend), snake_case (backend)
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

## Architecture Patterns

### Frontend
- **Pages**: App Router with route groups for organization
- **Components**: Atomic design with ui/, feature-specific folders
- **State**: Zustand stores with persistence for auth/user data
- **API**: Centralized API client with typed responses
- **Styling**: Tailwind with custom Ghibli color system

### Backend
- **API**: RESTful endpoints grouped by feature
- **Models**: SQLAlchemy ORM with clear relationships
- **Services**: Business logic separated from API handlers
- **Schemas**: Pydantic for request/response validation
- **Config**: Environment-based configuration management

## Import Conventions
- **Frontend**: Use `@/` alias for src/ imports
- **Backend**: Relative imports within app/, absolute for external
- **Components**: Import UI components from `@/components/ui`
- **Types**: Centralized in `@/types` for shared interfaces