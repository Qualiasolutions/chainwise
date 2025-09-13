#!/bin/bash
set -e

# ChainWise Production Deployment Script
# Supports blue-green deployments with health checks and rollback capabilities

NAMESPACE="chainwise"
IMAGE_TAG="${1:-latest}"
TARGET_COLOR="${2:-auto}"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ON_FAILURE="${3:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    command -v curl >/dev/null 2>&1 || error "curl is required but not installed"
    
    kubectl cluster-info >/dev/null 2>&1 || error "Cannot connect to Kubernetes cluster"
    kubectl get namespace $NAMESPACE >/dev/null 2>&1 || error "Namespace $NAMESPACE does not exist"
    
    log "Prerequisites check passed"
}

# Determine current and target environments
determine_environments() {
    log "Determining current environment..."
    
    CURRENT_COLOR=$(kubectl get service chainwise-service -n $NAMESPACE -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")
    
    if [ "$TARGET_COLOR" = "auto" ]; then
        if [ "$CURRENT_COLOR" = "blue" ]; then
            TARGET_COLOR="green"
        else
            TARGET_COLOR="blue"
        fi
    fi
    
    log "Current environment: $CURRENT_COLOR"
    log "Target environment: $TARGET_COLOR"
}

# Pre-deployment health check
pre_deployment_check() {
    log "Running pre-deployment health checks..."
    
    # Check database connectivity via current environment
    CURRENT_ENDPOINT=$(kubectl get service chainwise-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
    
    if [ "$CURRENT_ENDPOINT" != "localhost" ]; then
        curl -f -s "http://$CURRENT_ENDPOINT/api/health" >/dev/null || warn "Current environment health check failed"
        curl -f -s "http://$CURRENT_ENDPOINT/api/health/db" >/dev/null || warn "Database health check failed"
    fi
    
    # Check resource availability
    NODE_RESOURCES=$(kubectl top nodes --no-headers 2>/dev/null | awk '{cpu+=$2; mem+=$4} END {print cpu"m", mem"Mi"}')
    log "Cluster resources: $NODE_RESOURCES"
}

# Deploy to target environment
deploy_target_environment() {
    log "Deploying to $TARGET_COLOR environment with image: $IMAGE_TAG"
    
    # Update deployment with new image
    kubectl set image deployment/chainwise-app-$TARGET_COLOR chainwise=$IMAGE_TAG -n $NAMESPACE
    
    # Scale up target environment if it's scaled down
    CURRENT_REPLICAS=$(kubectl get deployment chainwise-app-$TARGET_COLOR -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    if [ "$CURRENT_REPLICAS" = "0" ]; then
        log "Scaling up $TARGET_COLOR environment..."
        kubectl scale deployment chainwise-app-$TARGET_COLOR --replicas=3 -n $NAMESPACE
    fi
    
    # Wait for rollout to complete
    log "Waiting for deployment rollout..."
    kubectl rollout status deployment/chainwise-app-$TARGET_COLOR -n $NAMESPACE --timeout=${HEALTH_CHECK_TIMEOUT}s
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=chainwise,color=$TARGET_COLOR -n $NAMESPACE --timeout=${HEALTH_CHECK_TIMEOUT}s
    
    log "$TARGET_COLOR environment deployment completed"
}

# Comprehensive health checks
run_health_checks() {
    log "Running health checks on $TARGET_COLOR environment..."
    
    # Get target service endpoint
    TARGET_ENDPOINT=$(kubectl get service chainwise-service-$TARGET_COLOR -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ -z "$TARGET_ENDPOINT" ]; then
        # Use port-forward for local testing
        log "Using port-forward for health checks..."
        kubectl port-forward service/chainwise-service-$TARGET_COLOR 8080:80 -n $NAMESPACE &
        PORT_FORWARD_PID=$!
        TARGET_ENDPOINT="localhost:8080"
        sleep 5
    fi
    
    # Wait for service to be ready
    log "Waiting for service to be ready..."
    sleep 30
    
    # Basic health check
    for i in {1..10}; do
        if curl -f -s "http://$TARGET_ENDPOINT/api/health" >/dev/null; then
            log "Basic health check passed"
            break
        fi
        if [ $i -eq 10 ]; then
            error "Basic health check failed after 10 attempts"
        fi
        sleep 10
    done
    
    # Database connectivity check
    curl -f -s "http://$TARGET_ENDPOINT/api/health/db" >/dev/null || error "Database connectivity check failed"
    log "Database connectivity check passed"
    
    # External services check
    curl -f -s "http://$TARGET_ENDPOINT/api/health/external" >/dev/null || warn "External services check failed (non-critical)"
    
    # Load test (basic)
    log "Running basic load test..."
    for i in {1..20}; do
        curl -f -s "http://$TARGET_ENDPOINT/api/health" >/dev/null &
    done
    wait
    log "Basic load test completed"
    
    # Clean up port-forward if used
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID 2>/dev/null || true
    fi
    
    log "All health checks passed for $TARGET_COLOR environment"
}

# Switch traffic to target environment
switch_traffic() {
    log "Switching traffic from $CURRENT_COLOR to $TARGET_COLOR..."
    
    # Create backup of current service configuration
    kubectl get service chainwise-service -n $NAMESPACE -o yaml > /tmp/chainwise-service-backup.yaml
    
    # Update main service to point to target environment
    kubectl patch service chainwise-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$TARGET_COLOR\"}}}"
    
    log "Traffic switched to $TARGET_COLOR environment"
    
    # Wait for DNS propagation
    sleep 10
    
    # Verify traffic switch
    log "Verifying traffic switch..."
    for i in {1..5}; do
        RESPONSE=$(curl -s https://chainwise.ai/api/health 2>/dev/null || echo "failed")
        if [ "$RESPONSE" != "failed" ]; then
            log "Traffic switch verification passed"
            break
        fi
        if [ $i -eq 5 ]; then
            error "Traffic switch verification failed"
        fi
        sleep 10
    done
}

# Post-deployment cleanup
post_deployment_cleanup() {
    log "Running post-deployment cleanup..."
    
    # Scale down old environment but keep 1 replica for quick rollback
    log "Scaling down $CURRENT_COLOR environment to 1 replica..."
    kubectl scale deployment chainwise-app-$CURRENT_COLOR --replicas=1 -n $NAMESPACE
    
    # Clean up old ReplicaSets
    kubectl delete rs $(kubectl get rs -n $NAMESPACE -o jsonpath='{.items[?(@.spec.replicas==0)].metadata.name}' 2>/dev/null | tr ' ' '\n' | head -5) -n $NAMESPACE 2>/dev/null || true
    
    log "Post-deployment cleanup completed"
}

# Rollback function
rollback() {
    error "Deployment failed. Rolling back to $CURRENT_COLOR environment..."
    
    # Scale up previous environment
    kubectl scale deployment chainwise-app-$CURRENT_COLOR --replicas=3 -n $NAMESPACE
    
    # Wait for rollback environment to be ready
    kubectl rollout status deployment/chainwise-app-$CURRENT_COLOR -n $NAMESPACE --timeout=180s
    
    # Switch traffic back
    kubectl patch service chainwise-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$CURRENT_COLOR\"}}}"
    
    # Scale down failed environment
    kubectl scale deployment chainwise-app-$TARGET_COLOR --replicas=0 -n $NAMESPACE
    
    error "Rollback completed. Service restored to $CURRENT_COLOR environment."
}

# Trap errors and rollback if enabled
trap 'if [ "$ROLLBACK_ON_FAILURE" = "true" ] && [ ! -z "$CURRENT_COLOR" ] && [ ! -z "$TARGET_COLOR" ]; then rollback; fi' ERR

# Main deployment flow
main() {
    log "Starting ChainWise production deployment..."
    log "Image: $IMAGE_TAG"
    
    check_prerequisites
    determine_environments
    pre_deployment_check
    deploy_target_environment
    run_health_checks
    switch_traffic
    post_deployment_cleanup
    
    log "🎉 Deployment completed successfully!"
    log "New version is now live on $TARGET_COLOR environment"
    log "Previous version ($CURRENT_COLOR) is scaled down but ready for quick rollback"
    
    # Display service status
    echo
    log "Service Status:"
    kubectl get deployments -n $NAMESPACE -l app=chainwise
    kubectl get services -n $NAMESPACE -l app=chainwise
}

# Show usage
usage() {
    echo "Usage: $0 [IMAGE_TAG] [TARGET_COLOR] [ROLLBACK_ON_FAILURE]"
    echo "  IMAGE_TAG: Docker image tag to deploy (default: latest)"
    echo "  TARGET_COLOR: blue|green|auto (default: auto)"
    echo "  ROLLBACK_ON_FAILURE: true|false (default: true)"
    echo
    echo "Examples:"
    echo "  $0                                    # Deploy latest to auto-determined environment"
    echo "  $0 v1.2.3                           # Deploy specific version"
    echo "  $0 latest blue                       # Deploy to blue environment specifically"
    echo "  $0 v1.2.3 green false              # Deploy without auto-rollback"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main deployment
main "$@"