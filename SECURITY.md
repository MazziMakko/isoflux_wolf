# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@fluxforge.ai**

Include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

We will respond within 48 hours and work with you to understand and resolve the issue.

## Security Best Practices

### For Users
1. **Keep dependencies updated**: Run `npm audit` regularly
2. **Secure environment variables**: Never commit `.env` files
3. **Use strong passwords**: Minimum 12 characters with mixed case, numbers, and symbols
4. **Enable 2FA**: When available on your account
5. **Regular backups**: Backup your database and configuration regularly

### For Developers
1. **Input validation**: Always validate and sanitize user input
2. **SQL injection prevention**: Use parameterized queries (handled by Supabase)
3. **XSS prevention**: Sanitize output, use Content Security Policy
4. **Authentication**: Use JWT tokens with proper expiration
5. **Authorization**: Implement RBAC with RLS policies
6. **Rate limiting**: Prevent abuse with request throttling
7. **Webhook security**: Always verify webhook signatures
8. **PII protection**: Sanitize before sending to AI models
9. **HTTPS only**: Never use HTTP in production
10. **Audit logging**: Log all security-relevant events

## Known Security Features

### Implemented
- ✅ Row-Level Security (RLS) on all tables
- ✅ RBAC with role hierarchy
- ✅ JWT authentication with secure tokens
- ✅ Webhook signature verification
- ✅ PII sanitization before AI processing
- ✅ Rate limiting on API endpoints
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS prevention with React escaping
- ✅ CSRF protection via SameSite cookies
- ✅ Audit logging for compliance
- ✅ Encrypted sensitive data at rest
- ✅ HTTPS enforcement in production
- ✅ Security headers (X-Frame-Options, CSP, etc.)

### Roadmap
- 🔄 Two-factor authentication (2FA)
- 🔄 IP allowlisting
- 🔄 Advanced threat detection
- 🔄 Anomaly detection in AI requests
- 🔄 Data encryption in transit (beyond HTTPS)

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported to security@fluxforge.ai
2. **Day 1-2**: Acknowledgment and initial assessment
3. **Day 3-7**: Investigation and fix development
4. **Day 8-14**: Testing and verification
5. **Day 15**: Security patch release
6. **Day 30**: Public disclosure (if appropriate)

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we:
- Acknowledge security researchers in our release notes
- Provide swag for significant findings
- May provide monetary rewards for critical vulnerabilities (case-by-case basis)

## Contact

- **Security Team**: security@fluxforge.ai
- **General Support**: support@fluxforge.ai
- **Emergency**: For critical issues, email with subject line "URGENT SECURITY"

## Security Updates

Subscribe to security updates:
- GitHub Security Advisories: Watch this repository
- Email: Subscribe at https://fluxforge.ai/security
- RSS: https://fluxforge.ai/security/feed

Thank you for helping keep FluxForge AI and our users safe!
