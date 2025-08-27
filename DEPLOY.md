# Deploying shot-client-next to Fly.io

## Prerequisites

1. Ensure you have Fly CLI installed (you already have it at `/Users/isaacpriestley/.fly/bin/flyctl`)
2. Be logged into Fly.io: `fly auth login`
3. Ensure shot-server is already deployed to Fly.io (assumed to be at `https://shot-server.fly.dev`)

## Configuration Files

The following files have been created for deployment:

- `Dockerfile` - Multi-stage Docker build for Next.js
- `.dockerignore` - Excludes unnecessary files from Docker build
- `fly.toml` - Fly.io configuration
- `next.config.ts` - Updated with `output: 'standalone'` for optimized Docker builds

## Initial Setup (First Time Only)

1. Create the Fly app:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
fly apps create shot-client-next
```

Note: If the name is taken, choose a different name and update it in `fly.toml`.

2. Set production secrets (if needed):
```bash
# If you have any server-side environment variables (non NEXT_PUBLIC_*)
# fly secrets set SECRET_KEY="your-secret-value"
```

## Deploy

Deploy the application:
```bash
fly deploy
```

This will:
- Build the Docker image with production environment variables
- Deploy to Fly.io
- Start the application with 1 instance minimum

## Post-Deployment

1. Check the deployment:
```bash
fly status
fly logs
```

2. Open the app:
```bash
fly open
```

Your app will be available at: `https://shot-client-next.fly.dev`

## Update Backend URLs

If your backend URL is different from `https://shot-server.fly.dev`, update the build args in `fly.toml`:

```toml
[build.args]
  NEXT_PUBLIC_API_BASE_URL = "https://your-actual-backend.fly.dev"
  NEXT_PUBLIC_SERVER_URL = "https://your-actual-backend.fly.dev"
  NEXT_PUBLIC_WEBSOCKET_URL = "wss://your-actual-backend.fly.dev"
```

## Scaling

To scale your app:
```bash
# Scale to 2 instances
fly scale count 2

# Scale memory/CPU
fly scale vm shared-cpu-2x --memory 1024
```

## Monitoring

View metrics and logs:
```bash
fly dashboard
fly logs -f  # Follow logs in real-time
```

## Updating the App

After making changes:
```bash
git add .
git commit -m "Your changes"
fly deploy
```

## Troubleshooting

1. If build fails, check Docker build locally:
```bash
docker build -t shot-client-next .
```

2. If app doesn't start, check logs:
```bash
fly logs
```

3. SSH into running instance:
```bash
fly ssh console
```

## Environment Variables

Build-time variables (NEXT_PUBLIC_*) are set in `fly.toml` under `[build.args]`.
These are baked into the build and visible in the browser.

Runtime variables (server-side only) would be set with:
```bash
fly secrets set VAR_NAME="value"
```