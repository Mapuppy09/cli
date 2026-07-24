# Security Policy

## Overview

This document outlines the security practices and vulnerability disclosure process for the `Mapuppy09/cli` project.

---

## Reporting Security Vulnerabilities

### ⚠️ Do NOT create public issues for security vulnerabilities

If you discover a security vulnerability, please report it privately:

1. **Email**: Send details to your security contact
2. **GitHub Security Advisory**: Use GitHub's private reporting
3. **Snyk**: Report through Snyk platform

### What to Include:
- Description of vulnerability
- Affected components/files
- Severity level
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

---

## Security Scanning

### Tools Used:

1. **Snyk**
   - Vulnerability scanning
   - Dependency analysis
   - Continuous monitoring
   - Automatic fix PRs

2. **GitHub Security**
   - Dependabot alerts
   - Secret scanning
   - Code scanning

3. **npm audit**
   - Built-in vulnerability checking
   - Dependency auditing

### How We Scan:

```bash
# Run Snyk scan
npm run security:scan

# Run npm audit
npm audit

# Check for secrets
npm run scan:secrets
```

---

## Security Best Practices

### For This Project:

#### 1. API Credentials
```javascript
// ❌ WRONG - Never hardcode credentials
const shopify = new ShopifyAPI({
  accessToken: 'shpat_xxxxxxxxxxxxx' // EXPOSED!
})

// ✅ CORRECT - Use environment variables
const shopify = new ShopifyAPI({
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN
})
```

#### 2. Error Handling
```javascript
// ❌ WRONG - Exposes sensitive info
catch (error) {
  console.log(error) // May contain tokens/keys
}

// ✅ CORRECT - Sanitize errors
catch (error) {
  const errorHandler = new ShopifyErrorHandler()
  const safe = errorHandler.handle(error) // Removes sensitive data
}
```

#### 3. Input Validation
```javascript
// ❌ WRONG - No validation
shopify.get(`/products/${id}`)

// ✅ CORRECT - Validate inputs
if (!id || typeof id !== 'number') {
  throw new Error('Invalid product ID')
}
shopify.get(`/products/${id}`)
```

#### 4. Webhook Verification
```javascript
// ✅ CORRECT - Verify webhook signatures
function verifyWebhookSignature(req, secret) {
  const hmac = req.headers['x-shopify-hmac-sha256']
  const body = req.rawBody
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmac
}
```

#### 5. Rate Limiting
```javascript
// ✅ CORRECT - Handle rate limits
shopify.on('rateLimit', (info) => {
  console.log(`Rate limited. Reset at: ${info.resetTime}`)
  // Implement backoff strategy
})
```

---

## Dependency Management

### Regular Updates:

1. **Weekly**: Check for new vulnerabilities
```bash
npm audit
```

2. **Monthly**: Update dependencies
```bash
npm update
```

3. **Quarterly**: Review major version updates
```bash
npm outdated
```

### Version Pinning:

```json
{
  "dependencies": {
    "axios": "~1.6.0",      // Patch updates only
    "lodash": "^4.17.20"    // Minor and patch
  },
  "devDependencies": {
    "jest": "^27.0.0"
  }
}
```

---

## Environment Variables

### Required for Security:

```bash
# .env (Never commit this file!)
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
SHOPIFY_STORE=my-store
SNYK_TOKEN=xxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

### .gitignore
```
# Secrets
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build
dist/
build/

# Logs
logs/
*.log
```

---

## Security Headers

### For Webhooks/API:

```javascript
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000')
  next()
})
```

---

## Code Review Guidelines

### Security Checklist:

- [ ] No hardcoded secrets/credentials
- [ ] Input validation present
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting implemented
- [ ] Webhook signatures verified
- [ ] Dependencies are up-to-date
- [ ] Snyk scan passes
- [ ] npm audit passes
- [ ] No console.log of sensitive data
- [ ] Environment variables used correctly

---

## Incident Response

### If a vulnerability is discovered:

1. **Assess severity** - Is it critical, high, medium, or low?
2. **Create fix** - Develop patch immediately
3. **Test thoroughly** - Ensure fix works
4. **Release patch** - Deploy security update
5. **Notify users** - Inform about vulnerability and fix
6. **Document** - Add to security advisories

---

## Security Resources

- 🔒 [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 📖 [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- 🛡️ [Snyk Security Docs](https://docs.snyk.io/)
- 🔑 [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Questions?

If you have security questions or concerns, please reach out privately.

**Your security matters!** 🔒
