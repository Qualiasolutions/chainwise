#!/bin/bash

# ChainWise Project Validation Script
# Based on Claude Code Complete Automation Workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Validation counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Validation functions
check_file() {
    local file="$1"
    local description="$2"
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if [ -f "$file" ]; then
        log_success "$description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        log_error "$description"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
}

check_directory() {
    local dir="$1"
    local description="$2"
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if [ -d "$dir" ]; then
        log_success "$description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        log_error "$description"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
}

check_command() {
    local cmd="$1"
    local description="$2"
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if command -v "$cmd" &> /dev/null; then
        log_success "$description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        log_error "$description"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
}

# Main validation script
main() {
    log_info "Starting ChainWise Project Validation..."
    echo

    # Project structure validation
    log_info "🏗️  Validating project structure..."
    check_file "package.json" "package.json exists"
    check_file "CLAUDE.md" "CLAUDE.md exists"
    check_file "next.config.ts" "Next.js config exists"
    check_file "tailwind.config.js" "Tailwind config exists"
    check_file "tsconfig.json" "TypeScript config exists"
    check_directory "src/app" "Next.js App Router structure"
    check_directory "src/components" "Components directory exists"
    check_directory "src/lib" "Lib directory exists"
    echo

    # Dependencies validation
    log_info "📦 Validating dependencies..."
    if [ -f "package.json" ]; then
        if npm list next &> /dev/null; then
            log_success "Next.js dependency installed"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        else
            log_error "Next.js dependency missing"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        fi
        CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

        if npm list @supabase/supabase-js &> /dev/null; then
            log_success "Supabase dependency installed"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        else
            log_error "Supabase dependency missing"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        fi
        CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    fi
    echo

    # Claude Code integration validation
    log_info "🤖 Validating Claude Code integration..."
    check_command "claude" "Claude CLI available"
    check_file ".mcp.json" "MCP configuration exists"
    check_directory ".claude" "Claude automation directory exists"
    echo

    # Database validation
    log_info "🗄️  Validating database setup..."
    check_directory "supabase" "Supabase directory exists"
    check_directory "supabase/migrations" "Database migrations exist"
    echo

    # Environment validation
    log_info "🔧 Validating environment..."
    if [ -f ".env.local" ]; then
        log_success "Local environment file exists"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))

        # Check for required env vars (without exposing values)
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
            log_success "Supabase URL configured"
        else
            log_warning "Supabase URL not configured"
            WARNINGS=$((WARNINGS + 1))
        fi

        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            log_success "Supabase anon key configured"
        else
            log_warning "Supabase anon key not configured"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        log_warning "Local environment file missing"
        WARNINGS=$((WARNINGS + 1))
    fi
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    echo

    # Development commands validation
    log_info "⚡ Validating development commands..."
    if npm run dev --dry-run &> /dev/null; then
        log_success "Dev command available"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        log_error "Dev command not working"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    if npm run build --dry-run &> /dev/null; then
        log_success "Build command available"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        log_error "Build command not working"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    echo

    # Security validation
    log_info "🔒 Validating security..."
    if [ -f ".gitignore" ]; then
        if grep -q ".env" .gitignore; then
            log_success "Environment files are gitignored"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
        else
            log_error "Environment files not properly gitignored"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        fi
    else
        log_error "No .gitignore file found"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    echo

    # Summary
    log_info "📊 Validation Summary"
    echo "Total Checks: $CHECKS_TOTAL"
    echo "Passed: $CHECKS_PASSED"
    echo "Failed: $CHECKS_FAILED"
    echo "Warnings: $WARNINGS"
    echo

    # Calculate percentage
    if [ $CHECKS_TOTAL -gt 0 ]; then
        PERCENTAGE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

        if [ $PERCENTAGE -ge 90 ]; then
            log_success "Project validation: ${PERCENTAGE}% ✨ Excellent!"
        elif [ $PERCENTAGE -ge 75 ]; then
            log_success "Project validation: ${PERCENTAGE}% 👍 Good!"
        elif [ $PERCENTAGE -ge 60 ]; then
            log_warning "Project validation: ${PERCENTAGE}% ⚠️  Needs improvement"
        else
            log_error "Project validation: ${PERCENTAGE}% ❌ Critical issues found"
        fi
    fi
    echo

    # Recommendations
    if [ $CHECKS_FAILED -gt 0 ] || [ $WARNINGS -gt 0 ]; then
        log_info "🔧 Recommendations:"
        if [ $CHECKS_FAILED -gt 0 ]; then
            echo "  • Address failed checks to improve project stability"
        fi
        if [ $WARNINGS -gt 0 ]; then
            echo "  • Review warnings to optimize project setup"
        fi
        echo "  • Refer to CLAUDE.md for detailed project setup guide"
        echo "  • Use 'npm run dev' to start development server"
        echo "  • Use 'npm run build' to test production build"
    fi

    # Exit with appropriate code
    if [ $CHECKS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"