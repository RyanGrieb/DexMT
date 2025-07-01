#!/bin/bash

# Simple test runner script
echo "🧪 -------------------------------- Starting DEXMT Test Runner... -------------------------------- 🧪"

# Get the script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up test environment..."
    "$SCRIPT_DIR/stop-test-env.sh"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start test environment using dedicated script
"$SCRIPT_DIR/start-test-env.sh"

# Check if start script succeeded
if [ $? -ne 0 ]; then
    echo "❌ Failed to start test environment"
    exit 1
fi

# Navigate back to hono directory for tests
cd hono

# Run unit tests
echo "🔧 --------------------------------  Running unit tests... --------------------------------  🔧"
npm run test:unit

if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed"
    exit 1
fi

# Run integration tests
echo "🔗 -------------------------------- Running integration tests... -------------------------------- 🔗"
# TODO: Change this to use: "test:integration": "vitest run tests/integration",
npx vitest run tests/integration

if [ $? -ne 0 ]; then
    echo "❌ Integration tests failed"
    exit 1
fi

# TODO: Run end-to-end tests

echo "✅ All tests passed!"