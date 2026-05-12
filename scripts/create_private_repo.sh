#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) not found. Install from https://cli.github.com/" >&2
  exit 1
fi

REPO_USER="${1:-YOUR_GITHUB_USERNAME}"
REPO_NAME="${2:-refurb-mini-spy-private}"
REMOTE_NAME="${3:-private}"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Detected branch: $BRANCH"

# Ensure working tree is committed
if [ -n "$(git status --porcelain)" ]; then
  echo "Committing local changes..."
  git add -A
  git commit -m "Prepare for private repo push" || true
else
  echo "No local changes to commit"
fi

# Create repo and push (will add remote named $REMOTE_NAME)
echo "Creating private repo: ${REPO_USER}/${REPO_NAME}..."
gh repo create "${REPO_USER}/${REPO_NAME}" --private --source . --remote "${REMOTE_NAME}" --push --confirm

echo "Repository created and code pushed to remote '${REMOTE_NAME}'"

# Optionally set secrets if environment variables are present
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "Setting TELEGRAM_BOT_TOKEN secret..."
  gh secret set TELEGRAM_BOT_TOKEN -R "${REPO_USER}/${REPO_NAME}" --body "$TELEGRAM_BOT_TOKEN"
fi
if [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "Setting TELEGRAM_CHAT_ID secret..."
  gh secret set TELEGRAM_CHAT_ID -R "${REPO_USER}/${REPO_NAME}" --body "$TELEGRAM_CHAT_ID"
fi
echo "Done. To trigger the check workflow now run:"
echo "  gh workflow run check-refurb.yml -R ${REPO_USER}/${REPO_NAME}"
