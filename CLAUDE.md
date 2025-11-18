# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 3001 with Turbopack)
- **Build**: `npm run build`
- **Linting**: `npm run lint` (ESLint with auto-fix)
- **Formatting**: `npm run format` (Prettier)
- **Format & Lint**: `npm run fl` (runs both format and lint in sequence)
- **Code generation**: `npm run generate:component` or `npm run generate:index` (uses Plop)

## Environment Configuration

The application supports switching between two backend APIs via `.env.local`:

```bash
# Copy example file and configure
cp .env.example .env.local
```

### Phoenix API (Recommended)
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:4002
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4002
NEXT_PUBLIC_BACKEND_TYPE=phoenix
```

### Rails API (Legacy)
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3000
NEXT_PUBLIC_BACKEND_TYPE=rails
```

Both backends provide:
- Identical RESTful `/api/v2/` endpoints
- JWT authentication
- ActionCable WebSocket support for real-time updates
- Image upload via ActiveStorage/ImageKit integration

## Project Architecture

This is a **Next.js 15** frontend for a Feng Shui 2 RPG game manager that supports **dual API backends**:

- **Phoenix/Elixir API** : Port 4002 - Modern Elixir implementation with full feature parity
- **Ruby on Rails API** : Port 3000 - Original Rails backend for backward compatibility

Both APIs provide identical `/api/v2/` endpoints and functionality. The backend selection is controlled via environment variables.

### Key Architectural Patterns

**API Client Architecture**: Uses a layered client system in `src/lib/client/`:
- `baseClient.ts` - Core HTTP methods with JWT authentication
- Individual clients (e.g., `characterClient.ts`, `campaignClient.ts`) - Model-specific API operations
- Main `Client.ts` - Aggregates all clients and provides unified interface

**Context-Based State Management**: 
- `AppContext.tsx` - Global app state, user authentication, campaign management
- `EncounterContext.tsx` - Real-time encounter/fight state via ActionCable WebSocket
- `ToastContext.tsx` - Global notification system

**Resource-Based Component Organization**: Each game resource (characters, campaigns, factions, etc.) has a dedicated component directory with:
- List/table views with filtering and sorting
- Detail views for individual resources
- Forms for create/edit operations
- Mobile-optimized components
- Autocomplete components for relationships

**Autocomplete System**: Extensive reusable autocomplete infrastructure:
- `ModelAutocomplete` - Generic autocomplete component using TypeScript generics
- Model-specific wrappers (e.g., `CharacterAutocomplete`, `FactionAutocomplete`)
- Complex filtering components (e.g., `CharacterFilter`) that coordinate multiple autocompletes
- See `DevelopingAutocomplete.md` for detailed implementation notes

### Real-Time Features

The app uses Rails ActionCable for real-time updates:
- `websocketClient.ts` manages WebSocket connections
- `CampaignChannel` subscription in `AppContext.tsx` for live campaign data
- Real-time encounter/fight updates for gameplay sessions

### Code Generation

Uses Plop.js for component scaffolding:
- `npm run generate:index` - Creates complete CRUD component sets
- Templates in `plop-templates/` directory
- Generates List, Filter, Form, Table components and index files

### Styling and UI

- **Material-UI v7** with custom theme (`customThemeOptions.ts`, `theme.ts`)
- **SCSS modules** for component-specific styles
- **Responsive design** with mobile-specific components
- Custom UI components in `src/components/ui/`

### Authentication and Data Flow

1. JWT tokens stored in cookies via `js-cookie`
2. User state managed through `AppContext` with localStorage caching
3. Campaign selection and switching with local storage persistence
4. All API calls include JWT authentication headers

### File Organization

- `src/app/` - Next.js 15 App Router pages and layouts
- `src/components/` - Organized by resource type (characters, campaigns, etc.)
- `src/lib/` - Utility functions and API clients
- `src/contexts/` - React contexts for global state
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks

### Development Notes

- Uses **double quotes** and **no semicolons** in TypeScript/JavaScript
- Avoids `any` types in favor of proper TypeScript typing
- Custom error handling via `errorHandler.ts`
- Extensive use of Material-UI components and styling system
- Component index files for clean imports
- an Entity in my app is one of the following - Fights
- Characters
- Vehicles
- Schticks
- Weapons
- Sites
- Parties
- Factions
- Junctures
- Users
- Campaigns
