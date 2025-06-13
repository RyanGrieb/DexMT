#!/bin/bash
# Open the postgres database in a new terminal window (while docker is running)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the postgres container is running
if ! docker ps | grep -q "postgres:15"; then
    echo "Error: PostgreSQL container is not running."
    echo "Please start your Docker Compose services first:"
    echo "  docker compose up"
    exit 1
fi

# Get the container name/ID for postgres
POSTGRES_CONTAINER=$(docker ps --format "table {{.Names}}" | grep postgres)

if [ -z "$POSTGRES_CONTAINER" ]; then
    # Fallback: try to find by image name
    POSTGRES_CONTAINER=$(docker ps --filter "ancestor=postgres:15" --format "{{.Names}}" | head -n 1)
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "Error: Could not find running PostgreSQL container."
    exit 1
fi

echo "Connecting to PostgreSQL database in container: $POSTGRES_CONTAINER"
echo "Database: dexmt"
echo "User: postgres"
echo ""
echo "Available commands:"
echo "  \\l          - List databases"
echo "  \\c dexmt    - Connect to dexmt database"
echo "  \\dt         - List tables"
echo "  \\d users    - Describe users table"
echo "  \\q          - Quit"
echo ""

# Connect to PostgreSQL using psql
docker exec -it "$POSTGRES_CONTAINER" psql -U postgres -d dexmt