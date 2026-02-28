#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# MultiBank UI Automation — Cross-Browser & Multi-Viewport Runner
# ──────────────────────────────────────────────────────────────
# Runs Playwright tests across:
#   Browsers  : Chrome, Firefox, Safari (WebKit)
#   Viewports : Fullscreen (1920×1080), Tablet (1024×768),
#               iPad (820×1180), Samsung S26 Ultra Max (412×915),
#               iPhone 17 Pro Max (440×956)
#
# After all runs, generates a single-page Allure report and opens it.
#
# Usage:
#   ./run-all-tests.sh                              # Run ALL 15 projects, default 4 workers
#   ./run-all-tests.sh -w 6                         # Run ALL 15 projects with 6 workers
#   ./run-all-tests.sh chromium -w 8                # Chrome all viewports, 8 workers
#   ./run-all-tests.sh samsung                      # Samsung S26 Ultra (all browsers)
#   ./run-all-tests.sh iphone -w 2                  # iPhone 17 Pro Max, 2 workers
#   ./run-all-tests.sh chromium-samsung-s26-ultra   # Run single project
#   ./run-all-tests.sh -p chromium,firefox,webkit   # Run specific project list
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Parse arguments ──
FILTER="all"
WORKERS_ARG=""
PROJECTS_LIST=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -w|--workers)
      WORKERS_ARG="$2"
      shift 2
      ;;
    -p|--projects)
      PROJECTS_LIST="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./run-all-tests.sh [FILTER] [-w|--workers N] [-p|--projects LIST]"
      echo ""
      echo "Filters (positional):"
      echo "  all (default)    Run all 15 projects"
      echo "  chromium|chrome  Chrome — all viewports"
      echo "  firefox          Firefox — all viewports"
      echo "  webkit|safari    Safari — all viewports"
      echo "  desktop          Fullscreen only (all browsers)"
      echo "  tablet           Tablet only (all browsers)"
      echo "  ipad             iPad only (all browsers)"
      echo "  samsung          Samsung S26 Ultra Max (all browsers)"
      echo "  iphone           iPhone 17 Pro Max (all browsers)"
      echo "  mobile           Both Samsung + iPhone (all browsers)"
      echo "  <project-name>   Run a specific project"
      echo ""
      echo "Options:"
      echo "  -w, --workers N    Number of parallel workers (default: 4)"
      echo "  -p, --projects L   Comma-separated list of project names to run"
      echo ""
      echo "Available projects:"
      echo "  chromium, firefox, webkit"
      echo "  chromium-tablet, firefox-tablet, webkit-tablet"
      echo "  chromium-ipad, firefox-ipad, webkit-ipad"
      echo "  chromium-samsung-s26-ultra, firefox-samsung-s26-ultra, webkit-samsung-s26-ultra"
      echo "  chromium-iphone-17-pro-max, firefox-iphone-17-pro-max, webkit-iphone-17-pro-max"
      echo ""
      echo "Examples:"
      echo "  ./run-all-tests.sh                                         # All 15 projects, 4 workers"
      echo "  ./run-all-tests.sh -w 6                                    # All 15 projects, 6 workers"
      echo "  ./run-all-tests.sh chromium -w 8                           # Chrome all viewports, 8 workers"
      echo "  ./run-all-tests.sh samsung -w 2                            # Samsung S26 Ultra, 2 workers"
      echo "  ./run-all-tests.sh -p chromium,firefox,webkit -w 8         # Specific projects"
      echo "  ./run-all-tests.sh -p chromium-ipad,webkit-ipad            # Multiple specific projects"
      exit 0
      ;;
    *)
      FILTER="$1"
      shift
      ;;
  esac
done

# ── Config ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

WORKERS="${WORKERS_ARG:-${WORKERS:-4}}"
ALLURE_RESULTS="allure-results"
ALLURE_REPORT="allure-report"

# All 15 projects defined in playwright.config.ts
ALL_PROJECTS=(
  "chromium"                    "firefox"                    "webkit"
  "chromium-tablet"             "firefox-tablet"             "webkit-tablet"
  "chromium-ipad"               "firefox-ipad"               "webkit-ipad"
  "chromium-samsung-s26-ultra"  "firefox-samsung-s26-ultra"  "webkit-samsung-s26-ultra"
  "chromium-iphone-17-pro-max"  "firefox-iphone-17-pro-max"  "webkit-iphone-17-pro-max"
)

# ── Helper functions ──
log_header() {
  echo ""
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════════════════════${NC}"
}

log_info() {
  echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $1"
}

# ── Resolve which projects to run ──
resolve_projects() {
  local filter="${1:-all}"

  case "$filter" in
    all)
      echo "${ALL_PROJECTS[@]}"
      ;;
    chromium|chrome)
      echo "chromium chromium-tablet chromium-ipad chromium-samsung-s26-ultra chromium-iphone-17-pro-max"
      ;;
    firefox)
      echo "firefox firefox-tablet firefox-ipad firefox-samsung-s26-ultra firefox-iphone-17-pro-max"
      ;;
    webkit|safari)
      echo "webkit webkit-tablet webkit-ipad webkit-samsung-s26-ultra webkit-iphone-17-pro-max"
      ;;
    desktop|fullscreen)
      echo "chromium firefox webkit"
      ;;
    tablet)
      echo "chromium-tablet firefox-tablet webkit-tablet"
      ;;
    ipad)
      echo "chromium-ipad firefox-ipad webkit-ipad"
      ;;
    samsung|samsung-s26)
      echo "chromium-samsung-s26-ultra firefox-samsung-s26-ultra webkit-samsung-s26-ultra"
      ;;
    iphone|iphone-17)
      echo "chromium-iphone-17-pro-max firefox-iphone-17-pro-max webkit-iphone-17-pro-max"
      ;;
    mobile)
      echo "chromium-samsung-s26-ultra firefox-samsung-s26-ultra webkit-samsung-s26-ultra chromium-iphone-17-pro-max firefox-iphone-17-pro-max webkit-iphone-17-pro-max"
      ;;
    *)
      # Treat as a specific project name
      echo "$filter"
      ;;
  esac
}

# ── Dependency check helpers ──
prompt_install() {
  local name="$1"
  local cmd="$2"
  echo ""
  echo -e "${YELLOW}[MISSING]${NC} $name is not installed."
  echo -e "  Install command: ${BOLD}$cmd${NC}"
  echo ""
  read -rp "  Install now? (y/N): " answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    log_info "Installing $name..."
    eval "$cmd"
    if [ $? -eq 0 ]; then
      log_success "$name installed successfully."
    else
      log_error "Failed to install $name. Please install manually:"
      log_error "  $cmd"
      exit 1
    fi
  else
    log_error "Cannot proceed without $name."
    log_error "  Run: $cmd"
    exit 1
  fi
}

check_dependencies() {
  log_header "Checking Dependencies"
  local missing=0

  # 1. Node.js
  if ! command -v node &>/dev/null; then
    log_error "Node.js is not installed."
    log_error "  Install from: https://nodejs.org/ (v18+ required)"
    exit 1
  fi
  local node_ver
  node_ver="$(node --version)"
  local node_major="${node_ver#v}"
  node_major="${node_major%%.*}"
  if [ "$node_major" -lt 18 ]; then
    log_error "Node.js $node_ver is too old. v18+ required."
    log_error "  Install from: https://nodejs.org/"
    exit 1
  fi
  log_success "Node.js $node_ver"

  # 2. npm
  if ! command -v npm &>/dev/null; then
    log_error "npm is not installed. It ships with Node.js — reinstall Node."
    exit 1
  fi
  log_success "npm $(npm --version)"

  # 3. npm dependencies (node_modules)
  if [ ! -d "node_modules" ]; then
    prompt_install "npm dependencies (node_modules)" "npm install"
    missing=1
  else
    # Check critical packages exist
    local critical_pkgs=("@playwright/test" "allure-playwright" "allure-commandline" "@axe-core/playwright" "typescript")
    local pkgs_missing=()
    for pkg in "${critical_pkgs[@]}"; do
      if [ ! -d "node_modules/$pkg" ] && [ ! -d "node_modules/@${pkg#@}" ]; then
        # Handle scoped packages
        local pkg_path="node_modules/$pkg"
        if [ ! -d "$pkg_path" ]; then
          pkgs_missing+=("$pkg")
        fi
      fi
    done

    if [ ${#pkgs_missing[@]} -gt 0 ]; then
      log_warn "Missing packages: ${pkgs_missing[*]}"
      prompt_install "missing npm packages" "npm install"
      missing=1
    else
      log_success "npm packages installed"
    fi
  fi

  # 4. Playwright browsers
  local browsers_dir
  if [[ "$OSTYPE" == "darwin"* ]]; then
    browsers_dir="$HOME/Library/Caches/ms-playwright"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    browsers_dir="$HOME/.cache/ms-playwright"
  else
    browsers_dir="$HOME/.cache/ms-playwright"
  fi

  if [ ! -d "$browsers_dir" ] || [ -z "$(ls -A "$browsers_dir" 2>/dev/null)" ]; then
    prompt_install "Playwright browsers" "npx playwright install --with-deps"
    missing=1
  else
    log_success "Playwright browsers cached"
  fi

  # 5. Allure CLI (via npx — just verify the package exists)
  if [ ! -d "node_modules/allure-commandline" ]; then
    log_warn "allure-commandline not found — Allure report generation may fail."
    prompt_install "allure-commandline" "npm install"
    missing=1
  else
    log_success "Allure CLI available"
  fi

  if [ $missing -eq 0 ]; then
    log_success "All dependencies satisfied"
  fi
  echo ""
}

# ── Main ──
log_header "MultiBank UI Automation — Full Test Suite"

# If -p/--projects was provided, use that list; otherwise resolve from filter
if [[ -n "$PROJECTS_LIST" ]]; then
  # Convert comma-separated list to array
  IFS=',' read -ra PROJECTS_TO_RUN <<< "$PROJECTS_LIST"
  # Trim whitespace from each project name
  for i in "${!PROJECTS_TO_RUN[@]}"; do
    PROJECTS_TO_RUN[$i]="$(echo -e "${PROJECTS_TO_RUN[$i]}" | xargs)"
  done
  FILTER="custom (${#PROJECTS_TO_RUN[@]} projects)"
else
  PROJECTS_TO_RUN=($(resolve_projects "$FILTER"))
fi
TOTAL_PROJECTS=${#PROJECTS_TO_RUN[@]}

log_info "Date        : $(date '+%Y-%m-%d %H:%M:%S')"
log_info "Filter      : $FILTER"
log_info "Projects    : $TOTAL_PROJECTS"
log_info "Workers     : $WORKERS"
log_info ""

# ── Step 1: Check dependencies ──
check_dependencies

log_info "Node        : $(node --version)"
log_info ""

# ── Step 2: Clean previous results ──
log_header "Step 2/5 — Cleaning Previous Results"
rm -rf "$ALLURE_RESULTS" "$ALLURE_REPORT" test-results
log_success "Cleaned allure-results/, allure-report/, test-results/"

# ── Step 3: Install browsers (if needed) ──
log_header "Step 3/5 — Ensuring Browsers Are Installed"
npx playwright install --with-deps 2>/dev/null || npx playwright install
log_success "Browsers ready"

# ── Step 4: Run tests across all projects ──
log_header "Step 4/5 — Running Tests"

PASSED_PROJECTS=0
FAILED_PROJECTS=0
declare -a RESULTS=()
TOTAL_START=$(date +%s)

for PROJECT in "${PROJECTS_TO_RUN[@]}"; do
  echo ""
  echo -e "${BOLD}────────────────────────────────────────${NC}"
  echo -e "${BOLD}  Project: ${CYAN}$PROJECT${NC}"
  echo -e "${BOLD}────────────────────────────────────────${NC}"

  PROJECT_START=$(date +%s)

  # Run playwright test for this project; don't exit on failure (set +e)
  set +e
  npx playwright test \
    --project="$PROJECT" \
    --workers="$WORKERS" \
    2>&1
  EXIT_CODE=$?
  set -e

  PROJECT_END=$(date +%s)
  PROJECT_DURATION=$((PROJECT_END - PROJECT_START))

  if [ $EXIT_CODE -eq 0 ]; then
    log_success "$PROJECT — passed (${PROJECT_DURATION}s)"
    RESULTS+=("${GREEN}PASS${NC}  $PROJECT (${PROJECT_DURATION}s)")
    ((PASSED_PROJECTS++))
  else
    log_error "$PROJECT — failed (${PROJECT_DURATION}s)"
    RESULTS+=("${RED}FAIL${NC}  $PROJECT (${PROJECT_DURATION}s)")
    ((FAILED_PROJECTS++))
  fi
done

TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

# ── Summary ──
log_header "Test Results Summary"
echo ""
printf "  %-12s %s\n" "Browser" "Fullscreen   Tablet       iPad         Mobile"
echo "  ──────────── ──────────── ──────────── ──────────── ────────────"

for RESULT in "${RESULTS[@]}"; do
  echo -e "  $RESULT"
done

echo ""
log_info "Total projects : $TOTAL_PROJECTS"
log_info "Passed         : $PASSED_PROJECTS"
[ $FAILED_PROJECTS -gt 0 ] && log_error "Failed         : $FAILED_PROJECTS" || log_info "Failed         : 0"
log_info "Total time     : ${TOTAL_DURATION}s ($(( TOTAL_DURATION / 60 ))m $(( TOTAL_DURATION % 60 ))s)"
echo ""

# ── Step 5: Generate & Open Allure Report ──
log_header "Step 5/5 — Generating Allure Report (Single Page)"

if [ -d "$ALLURE_RESULTS" ] && [ "$(ls -A "$ALLURE_RESULTS" 2>/dev/null)" ]; then
  # Generate single-file Allure report
  npx allure generate "$ALLURE_RESULTS" --clean --single-file -o "$ALLURE_REPORT"
  log_success "Report generated at: $ALLURE_REPORT/"

  # Open the report
  log_info "Opening Allure report in browser..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$ALLURE_REPORT/index.html"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$ALLURE_REPORT/index.html" 2>/dev/null || log_warn "Could not open browser. Report at: $ALLURE_REPORT/index.html"
  elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    start "$ALLURE_REPORT/index.html"
  else
    log_warn "Unknown OS. Report at: $ALLURE_REPORT/index.html"
  fi

  log_success "Allure report opened!"
else
  log_error "No test results found in $ALLURE_RESULTS/. Skipping report generation."
fi

# ── Final status ──
echo ""
if [ $FAILED_PROJECTS -eq 0 ]; then
  log_header "ALL $TOTAL_PROJECTS PROJECTS PASSED"
  exit 0
else
  log_header "$FAILED_PROJECTS / $TOTAL_PROJECTS PROJECTS FAILED"
  exit 1
fi
