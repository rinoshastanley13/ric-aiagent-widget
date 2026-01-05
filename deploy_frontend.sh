#!/bin/bash

echo "Starting Frontend Deployment..."

# Pull latest changes
echo "Pulling latest changes from git..."
git pull

# Rebuild and restart container
echo "Rebuilding and restarting Widget container..."
sudo docker-compose up -d --build widget

# Wait for widget to start
echo "⏳ Waiting for widget to start..."
sleep 5

# Health check
if sudo docker ps | grep -q ricagent-widget; then
    echo "✅ Widget container is running!"
    
    # Test if widget is responding
    for i in {1..10}; do
        if curl -s --max-time 3 http://localhost:4000 > /dev/null 2>&1; then
            echo "✅ Widget is responding on port 4000!"
            break
        fi
        if [ $i -eq 10 ]; then
            echo "⚠️  Widget not responding - checking logs and restarting..."
            sudo docker logs ricagent-widget --tail 20
            sudo docker restart ricagent-widget
            sleep 5
        fi
        sleep 2
    done
else
    echo "❌ Widget container failed to start!"
    sudo docker logs ricagent-widget --tail 30
    exit 1
fi

# Restart Nginx to ensure proxy is active
echo "🔄 Restarting Nginx (if exists)..."
sudo docker restart ricagent-nginx 2>/dev/null || echo "  (Nginx not found in this project)"

# Prune unused
echo "Cleaning up..."
sudo docker image prune -f
sudo docker builder prune -f

echo ""
echo "Frontend Deployment Complete!"
echo ""
echo "🔍 Testing widget accessibility:"
curl -s --max-time 3 -I http://localhost:4000 2>/dev/null | head -1 && echo "  ✅ Widget accessible" || echo "  ❌ Widget not accessible"
