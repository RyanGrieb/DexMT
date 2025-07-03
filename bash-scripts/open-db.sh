#!/bin/bash
# Open the postgres database in a new terminal window (while docker is running)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Function to connect to a specific database
connect_to_db() {
    local container_name=$1
    local database_name=$2
    
    echo "Connecting to PostgreSQL database in container: $container_name"
    echo "Database: $database_name"
    echo "User: postgres"
    echo ""
    echo "Available commands:"
    echo "  \\l          - List databases"
    echo "  \\c $database_name    - Connect to $database_name database"
    echo "  \\dt         - List tables"
    echo "  \\d [table]  - Describe table"
    echo "  \\q          - Quit"
    echo ""
    
    # Connect to PostgreSQL using psql
    docker exec -it "$container_name" psql -U postgres -d "$database_name"
}

# Get all postgres containers
POSTGRES_CONTAINERS=($(docker ps --filter "ancestor=postgres:15" --format "{{.Names}}"))

if [ ${#POSTGRES_CONTAINERS[@]} -eq 0 ]; then
    echo "Error: No PostgreSQL containers are running."
    echo "Please start your Docker Compose services first:"
    echo "  docker compose up"
    exit 1
elif [ ${#POSTGRES_CONTAINERS[@]} -eq 1 ]; then
    # Only one postgres container, determine which database to use
    CONTAINER=${POSTGRES_CONTAINERS[0]}
    if [[ "$CONTAINER" == *"test"* ]]; then
        connect_to_db "$CONTAINER" "dexmt_test"
    else
        connect_to_db "$CONTAINER" "dexmt"
    fi
else
    # Multiple postgres containers, let user choose
    echo "Multiple PostgreSQL containers found:"
    for i in "${!POSTGRES_CONTAINERS[@]}"; do
        container=${POSTGRES_CONTAINERS[$i]}
        if [[ "$container" == *"test"* ]]; then
            echo "  $((i+1)). $container (test database: dexmt_test)"
        else
            echo "  $((i+1)). $container (main database: dexmt)"
        fi
    done
    echo ""
    
    read -p "Select container (1-${#POSTGRES_CONTAINERS[@]}): " choice
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#POSTGRES_CONTAINERS[@]} ]; then
        SELECTED_CONTAINER=${POSTGRES_CONTAINERS[$((choice-1))]}
        if [[ "$SELECTED_CONTAINER" == *"test"* ]]; then
            connect_to_db "$SELECTED_CONTAINER" "dexmt_test"
        else
            connect_to_db "$SELECTED_CONTAINER" "dexmt"
        fi
    else
        echo "Invalid selection. Exiting."
        exit 1
    fi
fi