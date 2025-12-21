#!/bin/bash

echo "Starting Frontend Deployment..."

# Pull latest changes
echo "Pulling latest changes from git..."
git pull

# Rebuild and restart container
echo "Rebuilding and restarting Widget container..."
# Using sudo as we identified earlier it was needed, or relies on user setup. 
# Since we are running as ubadmin on the box, and previous commands required password sometimes,
# but the successful run was via 'sudo -S'.
# Ideally scripts should be run with sudo or by a user with docker rights.
# I will assume the user runs this script with privileges or has docker rights.
docker-compose up -d --build

# Prune unused
echo "Cleaning up..."
docker image prune -f
docker builder prune -f

echo "Frontend Deployment Complete!"
