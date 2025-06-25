#!/bin/bash

# Setup Git Hooks to Prevent Secret Exposure
echo "Setting up git hooks to prevent secret exposure..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent secret exposure
echo "🔍 Checking for secrets before commit..."

# Check if gitleaks is installed
if command -v gitleaks &> /dev/null; then
    echo "Running gitleaks scan..."
    if ! gitleaks detect --source . --verbose; then
        echo "❌ Secrets detected! Commit blocked."
        echo "Please remove secrets from your files before committing."
        exit 1
    fi
else
    echo "⚠️  gitleaks not installed. Install with: brew install gitleaks"
fi

# Check for common secret patterns manually
echo "Running manual secret checks..."

# Check for .env files being tracked
if git diff --cached --name-only | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example$"; then
    echo "❌ .env file detected in commit! This could expose secrets."
    echo "Files found:"
    git diff --cached --name-only | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example$"
    exit 1
fi

# Check for API keys in staged files
if git diff --cached | grep -iE "(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]+['\"]"; then
    echo "❌ Potential API keys or secrets found in staged changes!"
    echo "Matches found:"
    git diff --cached | grep -iE "(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]+['\"]"
    exit 1
fi

echo "✅ No secrets detected. Commit proceeding..."
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🔍 Final secret check before push..."

# Check if gitleaks is installed
if command -v gitleaks &> /dev/null; then
    echo "Running gitleaks scan on push..."
    if ! gitleaks detect --source . --verbose; then
        echo "❌ Secrets detected! Push blocked."
        echo "Please remove secrets before pushing."
        exit 1
    fi
fi

echo "✅ Push security check passed."
EOF

# Make the hook executable
chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Checks for secrets before each commit"
echo "  - pre-push: Final check before pushing to remote"
echo ""
echo "To install gitleaks for better secret detection:"
echo "  macOS: brew install gitleaks"
echo "  Other: https://github.com/gitleaks/gitleaks" 