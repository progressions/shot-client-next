#!/bin/bash
# Deploy shot-client-next to Fly.io using LEGACY Rails backend configuration
#
# WARNING: This is for legacy Rails backend only.
# For production deployments, use ./deploy_phoenix.sh or just `fly deploy`

set -e

echo "WARNING: Deploying to LEGACY Rails backend configuration!"
echo "For production, use ./deploy_phoenix.sh instead."
echo ""

read -p "Are you sure you want to deploy to the Rails backend? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

echo "Deploying shot-client-next to shot-client-next app with Rails backend..."

# Build locally first to catch any errors
echo "Building locally..."
npm run build

# Deploy to Fly.io with explicit Rails configuration
echo "Deploying to Fly.io..."
fly deploy --app shot-client-next -c fly-rails.toml

echo "Deployment complete!"
echo "Application available at: https://shot-client-next.fly.dev/"
