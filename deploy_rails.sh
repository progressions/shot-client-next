#!/bin/bash
# Deploy shot-client-next to Fly.io using Rails backend configuration

set -e

echo "Deploying shot-client-next to shot-client-next app with Rails backend..."

# Build locally first to catch any errors
echo "Building locally..."
npm run build

# Deploy to Fly.io
echo "Deploying to Fly.io..."
fly deploy --app shot-client-next -c fly.toml

echo "Deployment complete!"
echo "Application available at: https://shot-client-next.fly.dev/"
