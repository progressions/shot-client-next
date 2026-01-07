#!/bin/bash
# Deploy shot-client-next to Fly.io using Phoenix backend configuration
#
# This is the PRIMARY deployment script for production.
# Uses the default fly.toml which is configured for Phoenix/Elixir backend.

set -e

echo "Deploying shot-client-next to shot-client-phoenix app with Phoenix backend..."

# Build locally first to catch any errors
echo "Building locally..."
npm run build

# Deploy to Fly.io (uses default fly.toml with Phoenix configuration)
echo "Deploying to Fly.io..."
fly deploy

echo "Deployment complete!"
echo "Application available at: https://shot-client-phoenix.fly.dev/"
echo "Also accessible at: https://chiwar.net/"
