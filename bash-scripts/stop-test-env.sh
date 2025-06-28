#!/bin/bash

echo "-------------------------------- 🛑 Stopping test environment... 🛑 --------------------------------"

# Get the script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Stop and clean up test containers
docker compose -f docker-compose.test.yml down --volumes --remove-orphans

echo "✅ Test environment stopped and cleaned up"