#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# MultiBank UI Automation — Git Push Script
# ──────────────────────────────────────────────────────────────
# Handles first-time init and subsequent stage/commit/push.
#
# Usage:
#   ./git-push.sh                          # Interactive — prompts for everything
#   ./git-push.sh -m "commit message"      # Provide commit message upfront
#   ./git-push.sh -b main                  # Specify branch (default: main)
#   ./git-push.sh -r origin                # Specify remote (default: origin)
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Logging ──
log_header() {
  echo ""
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}════════════════════════════════════════════════════════════${NC}"
}

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[DONE]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ── Auto-generate commit message from staged changes ──
generate_commit_message() {
  local added=0 modified=0 deleted=0 renamed=0
  local file_list=""

  while IFS= read -r line; do
    local status="${line:0:1}"
    local file="${line:3}"
    case "$status" in
      A) ((added++))   ;;
      M) ((modified++)) ;;
      D) ((deleted++))  ;;
      R) ((renamed++))  ;;
      *) ((modified++)) ;;
    esac
    # Collect short file names (basename) for summary
    file_list+="$(basename "$file"), "
  done < <(git diff --cached --name-status)

  # Remove trailing comma
  file_list="${file_list%, }"

  # Build message parts
  local parts=()
  [[ $added -gt 0 ]]    && parts+=("add $added file(s)")
  [[ $modified -gt 0 ]]  && parts+=("update $modified file(s)")
  [[ $deleted -gt 0 ]]  && parts+=("remove $deleted file(s)")
  [[ $renamed -gt 0 ]]  && parts+=("rename $renamed file(s)")

  # Join parts with comma
  local summary=""
  for i in "${!parts[@]}"; do
    if [ "$i" -eq 0 ]; then
      # Capitalize first word
      summary="${parts[$i]^}"
    else
      summary+=", ${parts[$i]}"
    fi
  done

  # Truncate file list if too long
  if [ ${#file_list} -gt 60 ]; then
    file_list="${file_list:0:57}..."
  fi

  echo "$summary — $file_list"
}

# ── Confirm prompt ──
confirm() {
  local prompt="$1"
  local default="${2:-n}"
  local yn_hint="y/N"
  [[ "$default" == "y" ]] && yn_hint="Y/n"

  read -rp "$(echo -e "${YELLOW}$prompt ($yn_hint): ${NC}")" answer
  answer="${answer:-$default}"
  [[ "$answer" =~ ^[Yy]$ ]]
}

# ── Parse arguments ──
COMMIT_MSG=""
BRANCH="main"
REMOTE="origin"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      COMMIT_MSG="$2"
      shift 2
      ;;
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    -r|--remote)
      REMOTE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./git-push.sh [-m MESSAGE] [-b BRANCH] [-r REMOTE]"
      echo ""
      echo "Options:"
      echo "  -m, --message MSG    Commit message (prompted if not provided)"
      echo "  -b, --branch NAME    Branch name (default: main)"
      echo "  -r, --remote NAME    Remote name (default: origin)"
      echo "  -h, --help           Show this help"
      echo ""
      echo "Examples:"
      echo "  ./git-push.sh                              # Interactive mode"
      echo "  ./git-push.sh -m \"Add new tests\"            # With commit message"
      echo "  ./git-push.sh -m \"Fix bug\" -b develop       # Commit to develop branch"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      echo "  Run ./git-push.sh --help for usage"
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Step 1: Check prerequisites ──
log_header "Git Push — MultiBank UI Automation"

# Check git is installed
if ! command -v git &>/dev/null; then
  log_error "git is not installed."
  log_error "  Install from: https://git-scm.com/downloads"
  exit 1
fi
log_success "git $(git --version | awk '{print $3}')"

# ── Step 2: Initialize or verify git repo ──
if [ ! -d ".git" ]; then
  log_header "Step 1 — First-Time Git Setup"
  log_warn "No git repository found in this directory."
  echo ""

  if ! confirm "  Initialize a new git repository?"; then
    log_error "Cannot push without a git repository. Exiting."
    exit 1
  fi

  # Init
  git init
  log_success "Git repository initialized"

  # Verify .gitignore exists
  if [ ! -f ".gitignore" ]; then
    log_warn ".gitignore not found — creating default"
    cat > .gitignore << 'GITIGNORE'
node_modules/
dist/
test-results/
playwright-report/
blob-report/
allure-results/
allure-report/
.env
*.tsbuildinfo
GITIGNORE
    log_success ".gitignore created"
  else
    log_success ".gitignore already exists"
  fi

  # Set branch name
  echo ""
  read -rp "$(echo -e "${YELLOW}  Branch name (default: $BRANCH): ${NC}")" branch_input
  BRANCH="${branch_input:-$BRANCH}"
  git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH" 2>/dev/null || true
  log_success "Branch: $BRANCH"

  # Set remote
  echo ""
  log_info "Configure remote repository."
  read -rp "$(echo -e "${YELLOW}  Remote URL (e.g., https://github.com/user/repo.git): ${NC}")" remote_url

  if [ -n "$remote_url" ]; then
    git remote add "$REMOTE" "$remote_url" 2>/dev/null || git remote set-url "$REMOTE" "$remote_url"
    log_success "Remote '$REMOTE' set to: $remote_url"
  else
    log_warn "No remote URL provided. You can add it later:"
    log_warn "  git remote add origin <URL>"
  fi

  echo ""
  IS_FIRST_PUSH=true
else
  log_info "Git repository found"

  # Get current branch
  CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    BRANCH="$CURRENT_BRANCH"
  fi
  log_info "Branch: $BRANCH"

  IS_FIRST_PUSH=false
fi

# ── Step 3: Show status ──
log_header "Step 2 — Review Changes"

echo ""
echo -e "${BOLD}Untracked files:${NC}"
git ls-files --others --exclude-standard | head -30
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard | wc -l | xargs)

echo ""
echo -e "${BOLD}Modified files:${NC}"
git diff --name-only 2>/dev/null | head -30
MODIFIED_COUNT=$(git diff --name-only 2>/dev/null | wc -l | xargs)

echo ""
echo -e "${BOLD}Already staged:${NC}"
git diff --cached --name-only 2>/dev/null | head -30
STAGED_COUNT=$(git diff --cached --name-only 2>/dev/null | wc -l | xargs)

echo ""
log_info "Untracked : $UNTRACKED_COUNT files"
log_info "Modified  : $MODIFIED_COUNT files"
log_info "Staged    : $STAGED_COUNT files"

TOTAL_CHANGES=$((UNTRACKED_COUNT + MODIFIED_COUNT))
if [ "$TOTAL_CHANGES" -eq 0 ] && [ "$STAGED_COUNT" -eq 0 ]; then
  log_warn "No changes to commit."
  exit 0
fi

# ── Step 4: Stage files ──
log_header "Step 3 — Stage Files"
echo ""

# Show what will be staged
echo -e "${BOLD}The following files will be staged:${NC}"
echo ""
git status --short
echo ""

if ! confirm "  Stage all changes? (git add -A)"; then
  # Selective staging
  log_info "Selective staging — enter file paths (one per line, empty line to finish):"
  STAGED_FILES=()
  while true; do
    read -rp "  File: " filepath
    [ -z "$filepath" ] && break
    if [ -e "$filepath" ]; then
      git add "$filepath"
      STAGED_FILES+=("$filepath")
      log_success "Staged: $filepath"
    else
      log_warn "File not found: $filepath"
    fi
  done

  if [ ${#STAGED_FILES[@]} -eq 0 ]; then
    log_error "No files staged. Exiting."
    exit 1
  fi
else
  git add -A
  log_success "All changes staged"
fi

# Show staged summary
echo ""
echo -e "${BOLD}Staged for commit:${NC}"
git diff --cached --stat
echo ""

# ── Step 5: Commit ──
log_header "Step 4 — Commit"

if [ -z "$COMMIT_MSG" ]; then
  # Auto-generate a commit message from staged changes
  AUTO_MSG=$(generate_commit_message)

  echo ""
  echo -e "${BOLD}Auto-generated message:${NC}"
  echo -e "  ${GREEN}$AUTO_MSG${NC}"
  echo ""
  echo -e "${CYAN}  What would you like to do?${NC}"
  echo -e "    ${BOLD}1)${NC} Use auto-generated message"
  echo -e "    ${BOLD}2)${NC} Enter custom message"
  echo -e "    ${BOLD}3)${NC} Edit auto-generated message"
  echo ""
  read -rp "$(echo -e "${YELLOW}  Choose (1/2/3) [1]: ${NC}")" choice
  choice="${choice:-1}"

  case "$choice" in
    1)
      COMMIT_MSG="$AUTO_MSG"
      log_success "Using auto-generated message"
      ;;
    2)
      echo ""
      echo -e "${CYAN}  Enter commit message (multi-line: end with empty line):${NC}"
      echo ""
      COMMIT_MSG=""
      while IFS= read -rp "  > " line; do
        [ -z "$line" ] && break
        if [ -z "$COMMIT_MSG" ]; then
          COMMIT_MSG="$line"
        else
          COMMIT_MSG="$COMMIT_MSG"$'\n'"$line"
        fi
      done
      ;;
    3)
      echo ""
      echo -e "${CYAN}  Edit the message (press Enter to keep, or type replacement):${NC}"
      read -rp "  > " -e -i "$AUTO_MSG" edited_msg
      COMMIT_MSG="${edited_msg:-$AUTO_MSG}"
      ;;
    *)
      COMMIT_MSG="$AUTO_MSG"
      log_info "Invalid choice — using auto-generated message"
      ;;
  esac

  if [ -z "$COMMIT_MSG" ]; then
    log_error "Empty commit message. Exiting."
    exit 1
  fi
fi

echo ""
echo -e "${BOLD}Commit message:${NC}"
echo "  $COMMIT_MSG"
echo ""

if ! confirm "  Proceed with commit?"; then
  log_warn "Commit cancelled. Changes remain staged."
  log_info "  Run: git commit -m \"your message\""
  exit 0
fi

git commit -m "$COMMIT_MSG"
log_success "Changes committed"

# ── Step 6: Push ──
log_header "Step 5 — Push to Remote"

# Check if remote is configured
REMOTE_URL=$(git remote get-url "$REMOTE" 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  log_warn "No remote '$REMOTE' configured."
  read -rp "$(echo -e "${YELLOW}  Remote URL (e.g., https://github.com/user/repo.git): ${NC}")" remote_url

  if [ -z "$remote_url" ]; then
    log_warn "No remote set. Commit saved locally."
    log_info "  Add remote later: git remote add origin <URL>"
    log_info "  Then push:        git push -u origin $BRANCH"
    exit 0
  fi

  git remote add "$REMOTE" "$remote_url" 2>/dev/null || git remote set-url "$REMOTE" "$remote_url"
  REMOTE_URL="$remote_url"
  log_success "Remote set to: $REMOTE_URL"
fi

echo ""
log_info "Remote : $REMOTE ($REMOTE_URL)"
log_info "Branch : $BRANCH"
echo ""

if ! confirm "  Push to $REMOTE/$BRANCH?" "y"; then
  log_warn "Push cancelled. Commit saved locally."
  log_info "  Push later: git push -u $REMOTE $BRANCH"
  exit 0
fi

echo ""
if [ "$IS_FIRST_PUSH" = true ] || ! git rev-parse --verify "$REMOTE/$BRANCH" &>/dev/null; then
  log_info "First push — setting upstream..."
  git push -u "$REMOTE" "$BRANCH"
else
  git push "$REMOTE" "$BRANCH"
fi

log_success "Pushed to $REMOTE/$BRANCH"

# ── Summary ──
log_header "Push Complete"
echo ""
log_info "Branch  : $BRANCH"
log_info "Remote  : $REMOTE_URL"
log_info "Commit  : $(git log --oneline -1)"
echo ""
