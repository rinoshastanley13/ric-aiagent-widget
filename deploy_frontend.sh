#!/bin/bash

# Configuration
PROJECT_DIR="/home/ubadmin/ric-aiagent"

echo "--------------------------------------------------"
echo "🚀 Starting Frontend Widget Rebuild Only"
echo "--------------------------------------------------"

echo "📂 Switching to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "❌ Directory $PROJECT_DIR not found"; exit 1; }

echo "📦 Pulling latest code..."
git checkout main
git pull

echo "♻️  Rebuilding and restarting Widget container..."
# Target specifically the ricagent-widget service
sudo docker-compose up -d --build --force-recreate ricagent-widget

echo "⏳ Waiting for widget to start..."
sleep 5

# Health check
if sudo docker ps | grep -q ricagent-widget; then
    echo "✅ Widget container is running!"
    
    # Test if widget is responding on exposed port 3001
    for i in {1..15}; do
        if curl -s --max-time 3 http://localhost:3001/test-embed.html > /dev/null 2>&1; then
            echo "✅ Widget is responding on port 3001!"
            break
        fi
        if [ $i -eq 15 ]; then
            echo "⚠️  Widget not responding - checking logs..."
            sudo docker logs ricagent-widget --tail 20
        fi
        sleep 2
    done
else
    echo "❌ Widget container failed to start!"
    sudo docker logs ricagent-widget --tail 30
    exit 1
fi

# Restart Nginx to ensure proxy is active (optional but good practice)
echo "🔄 Restarting Nginx to ensure connectivity..."
sudo docker restart ricagent-nginx 2>/dev/null || true

echo ""
echo "--------------------------------------------------"
echo "🎉 Frontend Deployment Complete!"
echo "--------------------------------------------------"
echo ""
echo "🔍 Access Widget at:"
echo "   - Direct: http://localhost:3001/test-embed.html"
echo "   - Main:   http://localhost/test-embed.html (via Nginx)"
