# Security Guidelines

This document outlines security best practices to prevent secret exposure and maintain a secure codebase.

## 🔒 Secret Management

### Environment Variables
- **NEVER** commit `.env` files with real secrets
- Always use `.env.example` as a template with placeholder values
- Keep `.env` in `.gitignore` (already configured)

### Before Making Changes
1. **Always check `.gitignore`** includes `.env` before creating environment files
2. **Use placeholders first** - create `.env` files with dummy values initially
3. **Test git hooks** - ensure pre-commit hooks are working

## 🛡️ Protection Measures Implemented

### 1. Enhanced `.gitignore`
- Comprehensive patterns for environment files
- API key patterns
- Secret file patterns
- Supabase-specific ignores

### 2. Git Hooks
- **Pre-commit hook**: Scans for secrets before each commit
- **Pre-push hook**: Final check before pushing to remote
- **Manual patterns**: Detects common secret patterns even without gitleaks

### 3. Gitleaks Configuration
- Custom rules for Supabase keys
- OpenAI API key detection
- Environment variable scanning
- Install: `brew install gitleaks`

## 🚨 If Secrets Are Exposed

### Immediate Actions
1. **Rotate all exposed credentials immediately**
2. **Delete and recreate Supabase database** (if keys were exposed)
3. **Generate new API keys** for all services
4. **Clean git history** if secrets were committed

### Prevention for Next Time
1. **Run setup script**: `./scripts/setup-git-hooks.sh`
2. **Install gitleaks**: `brew install gitleaks`
3. **Test hooks**: Try committing a test file with fake secrets
4. **Always use `.env.example`** as your starting point

## 📋 Checklist Before Committing

- [ ] `.env` files are in `.gitignore`
- [ ] No real secrets in staged files
- [ ] Using `.env.example` as template
- [ ] Git hooks are installed and working
- [ ] All API keys are in environment variables, not hardcoded

## 🔧 Emergency Commands

### Check if secrets are in git history:
```bash
git log --patch | grep -i "supabase\|openai\|api"
```

### Remove file from git history (DANGEROUS):
```bash
git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' HEAD
```

### Test secret detection:
```bash
gitleaks detect --source . --verbose
```

## 📞 Security Contacts

If you discover a security vulnerability:
1. Do NOT commit the discovery
2. Rotate any exposed credentials immediately
3. Contact the team lead
4. Document the incident for future prevention

---

**Remember**: Security is everyone's responsibility. When in doubt, ask! 