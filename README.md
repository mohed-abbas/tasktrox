# Tasktrox

A modern, full-stack Kanban project management application built with Next.js 15 and Express.js.

```
 ████████╗ █████╗ ███████╗██╗  ██╗████████╗██████╗  ██████╗ ██╗  ██╗
 ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝╚══██╔══╝██╔══██╗██╔═══██╗╚██╗██╔╝
    ██║   ███████║███████╗█████╔╝    ██║   ██████╔╝██║   ██║ ╚███╔╝
    ██║   ██╔══██║╚════██║██╔═██╗    ██║   ██╔══██╗██║   ██║ ██╔██╗
    ██║   ██║  ██║███████║██║  ██╗   ██║   ██║  ██║╚██████╔╝██╔╝ ██╗
    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
```

## Features

- **Kanban Board** - Drag-and-drop task management with smooth animations
- **Real-time Collaboration** - Live presence indicators and instant updates via WebSocket
- **Multiple Views** - Board, List, and Grid view modes
- **Task Management** - Labels, priorities, due dates, assignees, and file attachments
- **Search & Filter** - Global search with advanced filtering options
- **Authentication** - Email/password and Google OAuth support
- **Dashboard & Reports** - Project analytics and activity tracking

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 (App Router)                   │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │    │
│  │  │  shadcn   │  │ TanStack  │  │  @dnd-kit │  │ Socket.io │ │    │
│  │  │    /ui    │  │   Query   │  │   (DnD)   │  │  Client   │ │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS / WSS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVER (API)                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Express.js + TypeScript                  │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │    │
│  │  │ Passport  │  │    Zod    │  │  Prisma   │  │ Socket.io │ │    │
│  │  │  (Auth)   │  │ (Validate)│  │   (ORM)   │  │  Server   │ │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
│    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐        │
│    │ PostgreSQL  │      │    Redis    │      │ Cloudflare  │        │
│    │  (Neon)     │      │  (Upstash)  │      │     R2      │        │
│    │             │      │             │      │             │        │
│    │  Database   │      │  Sessions   │      │   Files     │        │
│    │  Storage    │      │  Presence   │      │  Storage    │        │
│    │             │      │   Cache     │      │             │        │
│    └─────────────┘      └─────────────┘      └─────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Task Drag & Drop
```
User Drags Task ──► Optimistic UI Update ──► API Request (Background)
                          │                         │
                          ▼                         ▼
                    Instant Visual            Success? ─► Done
                      Feedback                    │
                                           Failure? ─► Rollback + Error
```

### Real-time Presence
```
User Starts Editing
        │
        ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Socket Emit   │────►│ Redis Store   │────►│ Broadcast to  │
│ editing:start │     │ (30s TTL)     │     │ Other Users   │
└───────────────┘     └───────────────┘     └───────────────┘
                                                    │
                                                    ▼
                                            "X is editing..."
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | React framework with App Router |
| UI Components | shadcn/ui, Framer Motion | Accessible components + animations |
| State Management | TanStack Query | Server state + caching |
| Drag & Drop | @dnd-kit | Smooth task reordering |
| Backend | Express.js, TypeScript | REST API + WebSocket server |
| Database | PostgreSQL (Prisma ORM) | Primary data storage |
| Cache/Sessions | Redis | Presence state, caching |
| File Storage | Cloudflare R2 | Attachments (S3-compatible) |
| Authentication | Passport.js, JWT | Local + OAuth strategies |

## Project Structure

```
tasktrox-dev/
├── frontend/                    # Next.js 15 application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Login, Register, Callback
│   │   │   ├── (dashboard)/     # Protected routes
│   │   │   │   ├── dashboard/   # Overview
│   │   │   │   ├── projects/    # Project boards
│   │   │   │   ├── reports/     # Analytics
│   │   │   │   └── profile/     # User settings
│   │   │   └── page.tsx         # Landing page
│   │   ├── components/
│   │   │   ├── board/           # Kanban board components
│   │   │   ├── task/            # Task card & modal
│   │   │   ├── landing/         # Marketing pages
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities, API client
│   │   └── providers/           # Context providers
│   └── public/                  # Static assets
│
├── backend/                     # Express.js API
│   ├── src/
│   │   ├── config/              # Database, Redis, Passport
│   │   ├── controllers/         # Route handlers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Auth, validation, rate limiting
│   │   ├── routes/              # API endpoints
│   │   ├── sockets/             # WebSocket handlers
│   │   └── validators/          # Zod schemas
│   └── prisma/
│       └── schema.prisma        # Database schema
│
└── docker-compose.yml           # Local development
```

## Database Schema

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │◄──────│ Project  │◄──────│  Column  │◄──────│   Task   │
└──────────┘       └──────────┘       └──────────┘       └──────────┘
     │                  │                                      │
     │                  ▼                                      │
     │            ┌──────────┐                                 │
     │            │  Label   │◄────────────────────────────────┤
     │            └──────────┘                                 │
     │                                                         │
     └─────────────────────────────────────────────────────────┤
                                                               │
                      ┌──────────┐    ┌──────────┐    ┌────────▼───┐
                      │ Comment  │    │Attachment│    │  Activity  │
                      └──────────┘    └──────────┘    └────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/google` | Google OAuth |
| **Projects** | | |
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects` | Create project |
| PATCH | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| **Tasks** | | |
| POST | `/api/v1/tasks` | Create task |
| PATCH | `/api/v1/tasks/:id` | Update task |
| PATCH | `/api/v1/tasks/:id/move` | Move task |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| **Columns** | | |
| GET | `/api/v1/projects/:id/columns` | List columns |
| POST | `/api/v1/projects/:id/columns` | Create column |
| PATCH | `/api/v1/columns/:id/reorder` | Reorder columns |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `editing:start` | Client → Server | `{ taskId, field }` |
| `editing:stop` | Client → Server | `{ taskId, field }` |
| `editing:active` | Server → Client | `{ taskId, field, user }` |
| `task:updated` | Server → Client | `{ task }` |
| `task:created` | Server → Client | `{ task }` |
| `task:moved` | Server → Client | `{ taskId, fromColumn, toColumn }` |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm 10+

### Local Development

```bash
# Clone the repository
git clone https://github.com/mohed-abbas/tasktrox.git
cd tasktrox/tasktrox-dev

# Install dependencies
npm install

# Start all services (PostgreSQL, Redis, Frontend, Backend)
docker-compose up

# Or run services separately:
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:4000
```

### Environment Variables

Create `.env` in the root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tasktrox

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=tasktrox-files
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION STACK                               │
│                                                                      │
│    ┌───────────┐        ┌───────────┐        ┌───────────────────┐  │
│    │  Vercel   │        │  Render   │        │  Managed Services │  │
│    │           │        │           │        │                   │  │
│    │  Next.js  │───────►│  Express  │───────►│  Neon (Postgres)  │  │
│    │ (Native)  │        │ (Docker)  │        │  Upstash (Redis)  │  │
│    │           │        │           │        │  R2 (Files)       │  │
│    └───────────┘        └───────────┘        └───────────────────┘  │
│                                                                      │
│    Free Tier: $0/month                                               │
└─────────────────────────────────────────────────────────────────────┘
```

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Vercel | Frontend hosting | 100GB bandwidth |
| Render | Backend hosting | 750 hours/month |
| Neon | PostgreSQL | 0.5GB storage |
| Upstash | Redis | 10K commands/day |
| Cloudflare R2 | File storage | 10GB storage |

## Scripts

```bash
npm run dev            # Start all services with Docker
npm run build          # Build frontend and backend
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio GUI
```

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with Next.js, Express.js, and PostgreSQL
