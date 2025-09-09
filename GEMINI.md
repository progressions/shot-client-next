# GEMINI.md

## Project Overview

This is a Next.js frontend for "Shot Client Next," an RPG game manager for the Feng Shui 2 roleplaying game. It connects to a Rails backend API to manage game data, including characters, fights, campaigns, and more. The application is built with Next.js, React, and Material-UI, and it uses TypeScript.

## Building and Running

### Prerequisites

- A running instance of the [shot-server](https://github.com/progressions/shot-server) Rails API on `localhost:3000`.
- A `.env.local` file with the following content:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000
  NEXT_PUBLIC_WS_URL=ws://localhost:3000/cable
  ```

### Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3001`.

### Building

To create a production build, run:

```bash
npm run build
```

The output will be in the `.next` directory, with a standalone version in `.next/standalone`.

### Testing

-   **Unit Tests:**
    ```bash
    npm run test
    ```
    This runs Jest tests. Test files are located in `__tests__` directories and have `.test.ts(x)` or `.spec.ts(x)` extensions.

-   **End-to-End Tests:**
    ```bash
    npm run e2e
    ```
    This runs Playwright tests.

## Development Conventions

### Code Style

-   The project uses Prettier for code formatting and ESLint for linting.
-   Run `npm run fl` to automatically format and fix linting issues.

### API Interaction

-   All API endpoint URLs are managed in `src/lib/Api.ts`. This class provides a centralized way to construct API URLs.
-   Authentication is handled via a JWT stored in a cookie named `jwtToken`. The `src/middleware.ts` file intercepts requests to enforce authentication.

### Code Generation

-   The project uses `plop` to scaffold new components and resources.
-   To generate a new resource (e.g., for "foos"), run `plop` and follow the prompts. This will create a set of files in `src/components/foos/` for managing the new resource, including list views, forms, and more.

### Key Files

-   `next.config.ts`: Next.js configuration. Note that it is set to ignore TypeScript and ESLint errors during builds.
-   `src/lib/Api.ts`: Defines all API endpoints.
-   `src/middleware.ts`: Handles authentication and routing.
-   `plopfile.js`: Configuration for the `plop` code generator.
-   `jest.config.js`: Jest configuration.
-   `package.json`: Lists all dependencies and scripts.
-   `README.md`: Contains general information about the project.
