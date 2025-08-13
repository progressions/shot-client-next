Here’s how you can develop a README for the `@progressions/shot-client-next` codebase based on your prompt and the existing structure:

---

# Shot Client Next

A frontend codebase for an RPG game manager focused on the roleplaying game Feng Shui 2. This project connects to [`@progressions/shot-server`](https://github.com/progressions/shot-server) to provide a complete experience for managing player sheets, tracking scenes, and facilitating gameplay.

## Features

- Built with [Next.js](https://nextjs.org), offering fast, modern web interactions.
- Connects seamlessly to the Shot Server backend for real-time updates and data management.
- Optimized UI for Feng Shui 2, including support for custom sheets, scene tracking, and game-specific mechanics.
- Uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for font optimization ([Geist](https://vercel.com/font)).
- Flexible development with support for npm, yarn, pnpm, and bun.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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