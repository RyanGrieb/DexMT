#!/bin/bash

echo "🐳 -------------------------------- Starting test environment... -------------------------------- 🐳"

# Get the script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Start test containers
docker compose -f docker-compose.test.yml up -d --build --remove-orphans

# Wait for health check
echo "⏳ Waiting for services to be ready..."
timeout=10
counter=0

while [ $counter -lt $timeout ]; do
    if curl -f -s http://localhost:8788/health > /dev/null 2>&1; then
        echo "✅ Test server is ready!"
        exit 0
    fi
    
    echo "⏳ Waiting for test server... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "❌ Test server failed to start within $timeout seconds"
docker compose -f docker-compose.test.yml logs
exit 1