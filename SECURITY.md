# Security Hardening Guide

## Row Level Security (RLS) Policies

### Current RLS Policies

All tables have RLS enabled. Key policies:

#### `parents` table
- Parents can only read/update their own profile
- System can insert parent profiles (via service role)

#### `children` table
- Primary parents can read/update their children
- Secondary parents (via invitations) have read-only access
- Children can read their own profile
- System can insert child profiles (via service role)

#### `parent_invitations` table
- Parents can read invitations they sent or received
- System can insert/update invitations

#### `onboarding_data` table
- Parents can read their children's onboarding data
- Children can read their own onboarding data
- System can insert/update onboarding data

#### `data_access_logs` table
- System can insert logs (via service role)
- Parents can read logs for their children

### RLS Policy Testing

To verify RLS policies are working correctly:

1. **Test parent access**: Verify parents can only access their own children
2. **Test child access**: Verify children can only access their own data
3. **Test secondary parent access**: Verify read-only access for invited parents
4. **Test unauthorized access**: Verify unauthorized users cannot access data

### Security Best Practices

1. **Never expose service role key** in client-side code
2. **Validate all inputs** on both client and server
3. **Use parameterized queries** (Supabase handles this automatically)
4. **Sanitize user inputs** before displaying
5. **Implement rate limiting** for sensitive endpoints
6. **Log security events** (failed logins, unauthorized access attempts)

## Authentication Security

### Parent Authentication
- Uses Supabase Auth (email/password)
- Supports social login (Google, Apple)
- Password reset via secure email tokens
- Session management via Supabase sessions

### Child Authentication
- Username/password authentication
- JWT tokens for session management
- Tokens stored in HTTP-only cookies when possible
- Tokens expire after 7 days

### Password Security
- Minimum 8 characters for passwords
- Passwords hashed using bcrypt (via Supabase)
- Child passwords hashed separately from parent passwords
- Password reset requires email verification

## Data Protection

### COPPA Compliance
- All child data access is logged
- Parents can export child data
- Parents can delete child accounts
- Minimal data collection from children

### Data Encryption
- Data encrypted in transit (TLS)
- Data encrypted at rest (Supabase default)
- Sensitive fields (passwords) are hashed, not encrypted

### Access Control
- Role-based access control (parent, child)
- Row-level security enforces data isolation
- API endpoints verify permissions before data access

## Security Headers

Recommended headers (configure in Vercel or hosting platform):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Vulnerability Management

1. **Regular dependency updates**: Keep all dependencies up to date
2. **Security audits**: Run `npm audit` regularly
3. **Dependency scanning**: Use tools like Snyk or Dependabot
4. **Penetration testing**: Regular security reviews

## Incident Response

If a security incident occurs:

1. **Immediately revoke** compromised credentials
2. **Review access logs** for unauthorized access
3. **Notify affected users** if personal data was compromised
4. **Document the incident** and remediation steps
5. **Update security measures** to prevent recurrence

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Input validation on all endpoints
- [x] Error handling without exposing sensitive info
- [x] Password hashing implemented
- [x] Session management secure
- [x] Data access logging implemented
- [x] COPPA compliance measures in place
- [ ] Rate limiting implemented (future)
- [ ] Security headers configured (future)
- [ ] Regular security audits scheduled (future)



