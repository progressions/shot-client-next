# Shot Client Next

A frontend codebase for an RPG game manager focused on the roleplaying game Feng Shui 2. This project connects to [`@progressions/shot-server`](https://github.com/progressions/shot-server) to provide a complete experience for managing player sheets, tracking scenes, and facilitating gameplay.

## Features

- Built with [Next.js](https://nextjs.org), offering fast, modern web interactions.
- Connects seamlessly to the Shot Server backend for real-time updates and data management.
- Optimized UI for Feng Shui 2, including support for custom sheets, scene tracking, and game-specific mechanics.
- Uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for font optimization ([Geist](https://vercel.com/font)).
- Flexible development with support for npm, yarn, pnpm, and bun.

## Getting Started

### Prerequisites

1. **Backend Server**: Ensure the Shot Server (Rails API) is running on port 3000
2. **Environment Configuration**: Create required environment files

### Environment Setup

Create a `.env.local` file in the project root with the following configuration:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/cable

# Development settings
NODE_ENV=development
```

For testing environments, also create a `.env.test` file:

```bash
# Test API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_WS_URL=ws://localhost:3004/cable

# Test settings
NODE_ENV=test
```

**⚠️ Important**: The `.env.local` file is required for the application to connect to the backend API. Without it, authentication and data loading will fail.

### Development Server

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

- `src/`: Main source code.
- `public/`: Static assets.
- `plop-templates/`: Code generation templates.
- `DevelopingAutocomplete.md`: Documentation for autocompletion development.
- Configuration files for linting, formatting, TypeScript, and Next.js.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - interactive tutorial.
- [Shot Server](https://github.com/progressions/shot-server) - backend service for this client.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app). See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

You can further customize the README to include setup instructions for connecting to the server, contribution guidelines, and specific details about Feng Shui 2 integrations as needed.
