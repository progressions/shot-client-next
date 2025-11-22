#!/bin/bash
# Deploy shot-client-next to Fly.io using Phoenix backend configuration

set -e

echo "Deploying shot-client-next to shot-client-phoenix app with Phoenix backend..."

# Build locally first to catch any errors
echo "Building locally..."
npm run build

# Deploy to Fly.io
echo "Deploying to Fly.io..."
fly deploy --app shot-client-phoenix -c fly-phoenix.toml

echo "Deployment complete!"
echo "Application available at: https://shot-client-phoenix.fly.dev/"
