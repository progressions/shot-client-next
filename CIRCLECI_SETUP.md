# CircleCI Setup for shot-client-next

## Prerequisites

1. **GitHub Repository**: The project is already at `git@github.com:progressions/shot-client-next.git`

2. **CircleCI Account**: You need access to CircleCI with permissions to set up projects

## Setup Steps

### 1. Connect Repository to CircleCI

1. Log in to [CircleCI](https://app.circleci.com/)
2. Go to "Projects" in the sidebar
3. Click "Set Up Project" or "Create Project"
4. Find `progressions/shot-client-next` repository
5. Click "Set Up Project"
6. Select "Use existing config" (we already have `.circleci/config.yml`)
7. Click "Start Building"

### 2. Configure Environment Variables

In CircleCI project settings, add these environment variables:

1. Go to Project Settings → Environment Variables
2. Add the following:
   - `FLY_API_TOKEN`: Your Fly.io API token (get it with `fly auth token`)

### 3. Create CircleCI Context (Optional - for shared variables)

If you want to share the Fly.io token across projects:

1. Go to Organization Settings → Contexts
2. Create a context named `fly-deployment`
3. Add `FLY_API_TOKEN` to this context
4. The config already references this context in the deploy job

### 4. Configure Branch Protection (Recommended)

In GitHub repository settings:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select CircleCI checks:
   - `test`
   - `build`

## Configuration Overview

The `.circleci/config.yml` includes:

### Jobs

1. **test**: Runs formatting check, linting, TypeScript check, and Jest tests
   - All checks are set to not fail the build (using `|| true`) to allow gradual improvement
   
2. **build**: Builds the Next.js application
   - Sets environment variables for API endpoints
   - Persists build artifacts for deployment
   
3. **deploy**: Deploys to Fly.io (only on main branch)
   - Installs flyctl
   - Runs deployment using Fly.io

### Workflow

The `test_build_deploy` workflow:
1. Runs tests
2. Builds the application (after tests pass)
3. Deploys to Fly.io (only on main branch, after build passes)

## Testing the Setup

1. Push to a feature branch to see tests and build run
2. Merge to main to trigger deployment

## Troubleshooting

### If deployment fails with authentication error:
- Ensure `FLY_API_TOKEN` is set correctly in CircleCI
- Regenerate token with `fly auth token` if needed

### If build fails:
- Check that all environment variables are set
- Review build logs for specific errors
- Ensure Node version matches local development (20.11.0)

### If tests fail:
- Tests are currently set to not fail the build (`|| true`)
- Review test output to fix issues gradually
- Remove `|| true` once tests are stable

## Local Testing

Test the CircleCI config locally:
```bash
# Install CircleCI CLI
brew install circleci

# Validate config
circleci config validate

# Run local build
circleci local execute --job test
```

## Notes

- TypeScript checks and linting are currently non-blocking (using `|| true`)
- This allows the pipeline to pass while you fix type errors
- Remove `|| true` from these steps once issues are resolved
- The deploy job only runs on the main branch
- Build artifacts are stored for debugging purposes