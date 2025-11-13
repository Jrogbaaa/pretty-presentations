#!/bin/bash

# Presenton Docker Management Script
# Usage: ./scripts/presenton-docker.sh [command]
# Commands: start, stop, status, logs, restart, pull

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Docker compose file
COMPOSE_FILE="docker-compose.presenton.yml"
CONTAINER_NAME="presenton"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        echo "  Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Check if .env.local exists
check_env() {
    if [ ! -f .env.local ]; then
        print_warning ".env.local file not found!"
        echo ""
        echo "Please create .env.local with the following variables:"
        echo "  OPENAI_API_KEY=your_openai_key"
        echo "  PEXELS_API_KEY=your_pexels_key"
        echo ""
        echo "See env.example for a template."
        exit 1
    fi
    
    # Source the .env.local file to check for required variables
    source .env.local
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_error "OPENAI_API_KEY is not set in .env.local"
        exit 1
    fi
    
    if [ -z "$PEXELS_API_KEY" ]; then
        print_warning "PEXELS_API_KEY is not set in .env.local (optional, but recommended for free images)"
    fi
}

# Start Presenton container
start() {
    print_info "Starting Presenton container..."
    check_docker
    check_env
    
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "Presenton container started!"
    echo ""
    print_info "Waiting for Presenton to be ready..."
    
    # Wait for container to be healthy (max 60 seconds)
    for i in {1..60}; do
        if docker ps --filter "name=$CONTAINER_NAME" --filter "health=healthy" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
            print_success "Presenton is healthy and ready!"
            echo ""
            echo "🎉 Presenton is now available at: http://localhost:5001"
            echo "📊 API endpoint: http://localhost:5001/api/v1/ppt/presentation/generate"
            echo ""
            echo "To view logs: ./scripts/presenton-docker.sh logs"
            exit 0
        fi
        sleep 1
    done
    
    print_warning "Container started but health check is taking longer than expected."
    echo "Check logs with: ./scripts/presenton-docker.sh logs"
}

# Stop Presenton container
stop() {
    print_info "Stopping Presenton container..."
    check_docker
    
    docker-compose -f $COMPOSE_FILE down
    
    print_success "Presenton container stopped!"
}

# Restart Presenton container
restart() {
    print_info "Restarting Presenton container..."
    stop
    sleep 2
    start
}

# Show container status
status() {
    check_docker
    
    if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        print_success "Presenton is running"
        echo ""
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        # Check health status
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")
        
        if [ "$HEALTH" == "healthy" ]; then
            print_success "Health: healthy ✓"
        elif [ "$HEALTH" == "starting" ]; then
            print_info "Health: starting..."
        else
            print_warning "Health: $HEALTH"
        fi
        
        echo ""
        print_info "Access Presenton at: http://localhost:5001"
    else
        print_warning "Presenton is not running"
        echo ""
        echo "Start it with: ./scripts/presenton-docker.sh start"
    fi
}

# Show container logs
logs() {
    check_docker
    
    if ! docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        print_error "Presenton container is not running"
        exit 1
    fi
    
    print_info "Showing Presenton logs (Ctrl+C to exit)..."
    echo ""
    docker logs -f $CONTAINER_NAME
}

# Pull latest Presenton image
pull() {
    print_info "Pulling latest Presenton image..."
    check_docker
    
    docker pull ghcr.io/presenton/presenton:latest
    
    print_success "Latest Presenton image downloaded!"
    echo ""
    echo "Restart the container to use the new image:"
    echo "  ./scripts/presenton-docker.sh restart"
}

# Show help
help() {
    echo "Presenton Docker Management Script"
    echo ""
    echo "Usage: ./scripts/presenton-docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start    - Start Presenton container"
    echo "  stop     - Stop Presenton container"
    echo "  restart  - Restart Presenton container"
    echo "  status   - Show container status"
    echo "  logs     - Show container logs (follow mode)"
    echo "  pull     - Pull latest Presenton image"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/presenton-docker.sh start"
    echo "  ./scripts/presenton-docker.sh status"
    echo "  ./scripts/presenton-docker.sh logs"
}

# Main command handler
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    pull)
        pull
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac

