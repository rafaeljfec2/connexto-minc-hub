# MINC Teams - Welcome Team Management System

People and team management system for the Welcome Team at Minha Church na Cidade.

## Architecture

This project uses a monorepo managed by **pnpm** and **Turborepo**:

- **Web Frontend**: React + TypeScript + Vite
- **Mobile Frontend**: React Native (to be implemented)
- **Backend**: Node.js + NestJS (to be implemented)

## Project Structure

```
connexto-minc-hub/
├── apps/
│   └── web/          # Web frontend (React + Vite)
├── packages/          # Shared packages (future)
└── turbo.json        # Turborepo configuration
```

## Technologies

### Web Frontend
- **React 18** with TypeScript
- **Vite** for build and development
- **React Router** for routing
- **Tailwind CSS** for styling (mobile-first)
- **Axios** for HTTP requests
- **React Hook Form** + **Zod** for forms and validation

## Development

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Start development (web frontend)
pnpm dev

# Production build
pnpm build

# Lint
pnpm lint
```

### Web Frontend Structure

```
apps/web/
├── src/
│   ├── components/     # Reusable components
│   │   ├── ui/        # Base UI components
│   │   └── layout/    # Layout components
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── pages/         # Application pages
│   ├── lib/           # Utilities and configuration
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main component
│   └── main.tsx       # Entry point
├── index.html
└── vite.config.ts
```

## MVP Features

- [x] Base project structure
- [x] Authentication and access control
- [x] Dashboard with indicators
- [ ] People management
- [ ] Team management
- [ ] Worship service schedule configuration
- [ ] Automatic team assignment
- [ ] Manual reassignment
- [ ] Attendance tracking
- [ ] Segmented communication

## Design System

The design is based on the theme of [minhachurchnacidade.com](https://minhachurchnacidade.com/), using:
- Warm gradient (orange/red) with grain texture
- Inter typography
- Dark color palette with primary accents
- Mobile-first approach

## Security

- JWT authentication
- Role-based access control (Admin, Coordinator, Leader, Member)
- Data validation on frontend and backend

## Deploy

The project is configured for deployment on **Vercel**.

### Environment Variables

Configure the following variables in the Vercel dashboard:

- `VITE_API_URL`: Backend API base URL (e.g. `https://api.minc-teams.com`)
- `VITE_MOCK_MODE`: `false` for production

For more details, see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) and [apps/web/ENV_VARIABLES.md](./apps/web/ENV_VARIABLES.md).

### Optimized Build

The project includes production optimizations:
- Automatic code splitting
- Minification with esbuild
- Static asset caching
- Separate vendor chunks

## Roadmap

1. **Phase 1**: Functional MVP
2. **Phase 2**: QR Code, reports, and automations
3. **Phase 3**: Expansion to other ministries
