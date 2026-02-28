# MultiBank — Git Usage Guide

## Quick Start

### First Time Setup (New Repository)

```bash
# Run the push script — it will detect no .git and walk you through setup
./git-push.sh
```

The script will:
1. Initialize a new git repository (`git init`)
2. Verify `.gitignore` exists (creates one if missing)
3. Prompt for branch name (default: `main`)
4. Prompt for remote URL (e.g., `https://github.com/user/repo.git`)
5. Stage all files, ask for commit message, and push

### Subsequent Pushes

```bash
# Interactive — prompts for everything
./git-push.sh

# With commit message
./git-push.sh -m "Add new test cases"

# With commit message and branch
./git-push.sh -m "Fix flaky test" -b develop
```

---

## Push Script (`git-push.sh`)

### Options

| Option | Description |
|--------|-------------|
| `-m, --message MSG` | Commit message (prompted if not provided) |
| `-b, --branch NAME` | Branch name (default: current branch or `main`) |
| `-r, --remote NAME` | Remote name (default: `origin`) |
| `-h, --help` | Show help |

### What the Script Does

```
Step 1 — First-Time Git Setup (only if no .git found)
         ├── git init
         ├── Verify .gitignore
         ├── Prompt for branch name
         └── Prompt for remote URL

Step 2 — Review Changes
         ├── Show untracked files
         ├── Show modified files
         └── Show already staged files

Step 3 — Stage Files
         ├── Show all changes (git status --short)
         ├── Confirm: "Stage all changes?" (Y/n)
         └── If No → selective file-by-file staging

Step 4 — Commit
         ├── If no -m flag provided:
         │   ├── Auto-generate message from staged changes
         │   ├── Show auto-generated message
         │   └── Choose: 1) Use auto  2) Enter custom  3) Edit auto
         ├── Show final commit message for review
         └── Confirm: "Proceed with commit?" (y/N)

Step 5 — Push to Remote
         ├── Verify remote is configured
         ├── Show remote URL and branch
         ├── Confirm: "Push to origin/main?" (Y/n)
         └── First push uses -u (set upstream)
```

### Examples

```bash
# Full interactive flow
./git-push.sh

# Quick push with message
./git-push.sh -m "Update performance thresholds"

# Push to a different branch
./git-push.sh -m "Feature: add new page tests" -b feature/new-pages

# Push to a different remote
./git-push.sh -m "Sync changes" -r upstream
```

### Auto-Generated Commit Messages

When you run the script **without** the `-m` flag, it automatically generates a short commit message based on your staged changes:

```
Auto-generated message:
  Add 2 file(s), update 3 file(s) — HomePage.ts, navigation.spec.ts, helpers.ts, ...

  What would you like to do?
    1) Use auto-generated message
    2) Enter custom message
    3) Edit auto-generated message

  Choose (1/2/3) [1]:
```

**How the auto-message is built:**
- Analyzes staged changes via `git diff --cached --name-status`
- Counts added, modified, deleted, and renamed files
- Includes file names (truncated if too long)
- Format: `Add N file(s), update N file(s) — file1, file2, ...`

**Options:**
| Choice | What Happens |
|--------|-------------|
| `1` (default) | Uses the auto-generated message as-is |
| `2` | Prompts you to type a custom message (multi-line supported) |
| `3` | Pre-fills the auto-generated message for inline editing |

> **Tip:** If you already know your commit message, use `-m` to skip this step entirely:
> `./git-push.sh -m "Fix navigation test flakiness"`

---

## Manual Git Commands

### Initialize Repository

```bash
# Initialize
git init

# Set branch name
git branch -M main

# Add remote
git remote add origin https://github.com/user/repo.git
```

### Daily Workflow

```bash
# Check what changed
git status

# Stage all changes
git add -A

# Stage specific files
git add tests/navigation.spec.ts src/pages/HomePage.ts

# Commit
git commit -m "Your commit message"

# Push
git push origin main

# First push (set upstream tracking)
git push -u origin main
```

### Branching

```bash
# Create and switch to a new branch
git checkout -b feature/new-tests

# Switch to existing branch
git checkout main

# List all branches
git branch -a

# Push new branch to remote
git push -u origin feature/new-tests

# Merge branch into main
git checkout main
git merge feature/new-tests

# Delete branch after merge
git branch -d feature/new-tests
```

### Viewing History

```bash
# Recent commits (one-line format)
git log --oneline -10

# Detailed log with file changes
git log --stat -5

# See what changed in last commit
git diff HEAD~1

# See changes not yet staged
git diff

# See staged changes (ready to commit)
git diff --cached
```

### Undoing Changes

```bash
# Unstage a file (keep changes in working directory)
git restore --staged <file>

# Discard changes in a file (revert to last commit)
git restore <file>

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo last commit (keep changes unstaged)
git reset HEAD~1
```

### Working with Remote

```bash
# Check remote configuration
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git

# Change remote URL
git remote set-url origin https://github.com/user/new-repo.git

# Fetch latest from remote (without merging)
git fetch origin

# Pull latest changes
git pull origin main
```

---

## .gitignore

The project `.gitignore` excludes these from version control:

| Pattern | What It Excludes |
|---------|-----------------|
| `node_modules/` | npm dependencies (reinstall via `npm install`) |
| `dist/` | Compiled TypeScript output |
| `test-results/` | Playwright test artifacts (screenshots, traces) |
| `playwright-report/` | Playwright HTML report |
| `blob-report/` | Playwright blob report |
| `allure-results/` | Raw Allure test results |
| `allure-report/` | Generated Allure HTML report |
| `.env` | Environment variables (contains secrets) |
| `*.tsbuildinfo` | TypeScript incremental build cache |

---

## Project Structure for Git

Files tracked in version control:

```
.
├── .github/workflows/playwright.yml    # CI/CD pipeline
├── .gitignore                          # Git ignore rules
├── docs/                               # Documentation
│   ├── README.md
│   ├── RUN-GUIDE.md
│   ├── TEST-SUMMARY.md
│   ├── CICD-PIPELINE.md
│   └── GIT-GUIDE.md
├── git-push.sh                         # Git push script
├── run-all-tests.sh                    # Test runner script
├── package.json                        # Dependencies and scripts
├── package-lock.json                   # Dependency lock file
├── playwright.config.ts                # Playwright configuration
├── tsconfig.json                       # TypeScript configuration
├── src/                                # Source code
│   ├── fixtures/test-fixtures.ts
│   ├── pages/                          # Page objects
│   └── utils/                          # Helpers and utilities
├── tasks/                              # Standalone coding tasks
│   └── string-character-frequency.ts
└── test-data/                          # External test data (JSON)
```

Files NOT tracked (generated/sensitive):

```
node_modules/        # Reinstall via: npm install
allure-results/      # Regenerate via: npm test
allure-report/       # Regenerate via: npm run report
test-results/        # Regenerate via: npm test
.env                 # Create from template — contains secrets
```

---

## Recommended Commit Messages

| Type | Format | Example |
|------|--------|---------|
| New feature | `Add <description>` | `Add accessibility tests for all pages` |
| Enhancement | `Update <description>` | `Update performance thresholds` |
| Bug fix | `Fix <description>` | `Fix flaky WebKit test on Features page` |
| Refactor | `Refactor <description>` | `Refactor BasePage overlay dismissal` |
| Documentation | `Docs: <description>` | `Docs: add CI/CD pipeline guide` |
| Config | `Config: <description>` | `Config: add BrowserStack support` |
| Test data | `Data: <description>` | `Data: update navigation test data` |
