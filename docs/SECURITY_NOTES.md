# Security Notes

This document outlines security considerations, authentication mechanisms, and best practices for the SoapBoard application.

## Authentication Architecture

### Clerk Integration

SoapBoard uses Clerk for user authentication and session management.

**Components**:
- **ClerkProvider**: Wraps the application in `app/layout.tsx`
- **Middleware**: Route protection via `proxy.ts`
- **JWT Tokens**: Used for backend authentication

**Flow**:
1. User signs in via Clerk
2. Clerk issues JWT token
3. Token stored in HTTP-only cookie
4. Token validated on each request
5. Token used for Convex and Liveblocks authentication

### Authentication Endpoints

**Protected Routes**:
- All routes except `/sign-in` require authentication
- Middleware configured in `proxy.ts`
- Uses `clerkMiddleware` with route matcher

**Public Routes**:
- `/sign-in(.*)` - Sign-in page

### JWT Configuration

**Clerk JWT Template**:
- Template name: `convex`
- Used by Convex backend for authentication
- Configured in Clerk dashboard

**Convex Auth Config**:
- File: `convex/auth.config.ts`
- Contains Clerk issuer domain
- Validates JWT tokens from Clerk

## Authorization

### Organization-Based Access Control

**Current Implementation**:
- Boards are scoped by `orgId` (organization ID)
- Users can only see boards in their organization
- Organization membership managed by Clerk

**Board Access**:
- `boards.get` query filters by `orgId`
- Users cannot access boards outside their organization
- Organization ID comes from Clerk's `useOrganization()` hook

### Board-Level Authorization

**Current State**:
- Board access check is **commented out** in `app/api/liveblocks-auth/route.ts`
- This means any authenticated user can access any board if they know the ID
- **Security Risk**: Should be enabled in production

**Recommended Fix**:
```typescript
// In app/api/liveblocks-auth/route.ts
if (board?.orgId !== authorization.orgId) {
  return new Response("Unauthorized", { status: 403 });
}
```

### User-Level Authorization

**Favorites**:
- User-specific (scoped by `userId`)
- Users can only favorite/unfavorite their own favorites
- Queries filter by `userId` from authentication token

**Board Creation**:
- `authorId` set from authenticated user
- Users can only create boards in their organization

## Data Security

### Database Security

**Convex Security**:
- All queries/mutations require authentication
- Functions validate `ctx.auth.getUserIdentity()`
- Database access controlled by Convex
- No direct database access from client

**Data Isolation**:
- Boards isolated by `orgId`
- Favorites isolated by `userId`
- No cross-organization data leakage

### Real-Time Security

**Liveblocks Security**:
- Authentication required via `/api/liveblocks-auth`
- Room access authorized per request
- WebSocket connections authenticated
- Presence data scoped to room

**Room Authorization**:
- Currently permissive (commented check)
- Should verify board belongs to user's organization
- Should verify user has access to board

### API Security

**API Routes**:
- `/api/liveblocks-auth` requires Clerk authentication
- Validates user before creating Liveblocks session
- Should validate board access (currently commented)

**CORS**:
- Not explicitly configured (Next.js default)
- API routes only accessible from same origin

## Input Validation

### Client-Side Validation

**Board Title**:
- Trimmed before submission
- Length validation (max 60 characters)
- Non-empty validation

**Layer Limits**:
- Maximum 100 layers per board
- Enforced in `insertLayer` mutation
- Prevents resource exhaustion

### Server-Side Validation

**Convex Functions**:
- All mutations validate authentication
- Input validation (title length, required fields)
- Type validation via Convex schema

**Example**:
```typescript
// In convex/board.ts
if (!title.trim()) {
  throw new Error("Title is required");
}
if (title.length > 60) {
  throw new Error("Title cannot be longer than 60 characters");
}
```

## Secrets Management

### Environment Variables

**Required Secrets**:
- `CLERK_SECRET_KEY` - Server-side only
- `LIVEBLOCKS_SECRET_KEY` - Server-side only
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public (safe to expose)
- `NEXT_PUBLIC_CONVEX_URL` - Public (safe to expose)
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` - Public (safe to expose)

**Security**:
- Never commit `.env.local` to git
- Use different keys for dev/prod
- Rotate keys periodically
- Use Vercel environment variables for production

### Secret Exposure

**Public Variables**:
- Variables prefixed with `NEXT_PUBLIC_` are exposed to client
- Only use for values safe to expose (public keys, URLs)
- Never include secrets in public variables

## Session Management

### Clerk Sessions

**Session Storage**:
- HTTP-only cookies (secure by default)
- Automatic token refresh
- Session expiration handled by Clerk

**Session Validation**:
- Middleware validates on each request
- Invalid sessions redirect to sign-in
- Token expiration handled automatically

### Liveblocks Sessions

**Session Creation**:
- Created per board access
- Validated on each connection
- Expires when user disconnects

## Security Best Practices

### ✅ Implemented

1. **Authentication Required**: All routes protected except sign-in
2. **JWT Validation**: Tokens validated on backend
3. **Input Validation**: Server-side validation in Convex
4. **Organization Isolation**: Data scoped by organization
5. **HTTPS Only**: Enforced by hosting platform (Vercel)
6. **Type Safety**: TypeScript prevents many errors

### ⚠️ Needs Attention

1. **Board Access Control**: Currently commented out in Liveblocks auth
2. **Error Messages**: May leak information (should be generic)
3. **Rate Limiting**: Not explicitly implemented (relies on services)
4. **CSRF Protection**: Next.js provides some protection, but verify
5. **XSS Prevention**: React escapes by default, but verify user input

### 🔒 Recommended Improvements

1. **Enable Board Access Check**:
   ```typescript
   // In app/api/liveblocks-auth/route.ts
   if (board?.orgId !== authorization.orgId) {
     return new Response("Unauthorized", { status: 403 });
   }
   ```

2. **Add Rate Limiting**:
   - Implement rate limiting for API routes
   - Limit mutations per user per time period
   - Prevent abuse of board creation

3. **Audit Logging**:
   - Log all board creation/deletion
   - Log access attempts
   - Monitor for suspicious activity

4. **Content Security Policy**:
   - Add CSP headers
   - Restrict script sources
   - Prevent XSS attacks

5. **Input Sanitization**:
   - Sanitize text layer content
   - Validate layer coordinates
   - Prevent injection attacks

6. **Error Handling**:
   - Generic error messages for users
   - Detailed errors only in logs
   - Don't leak system information

## Vulnerability Considerations

### Known Risks

1. **Board ID Enumeration**:
   - Board IDs are predictable (Convex document IDs)
   - Without org check, users could guess IDs
   - **Mitigation**: Enable organization check

2. **Layer Spam**:
   - No rate limiting on layer creation
   - Could create many layers quickly
   - **Mitigation**: Implement rate limiting

3. **Large Payloads**:
   - No size limits on layer data
   - Could send large path arrays
   - **Mitigation**: Validate payload sizes

### OWASP Top 10 Considerations

1. **Injection**: ✅ TypeScript and Convex prevent SQL injection
2. **Broken Authentication**: ⚠️ Board access check disabled
3. **Sensitive Data Exposure**: ✅ Secrets in env vars, not code
4. **XML External Entities**: N/A (not using XML)
5. **Broken Access Control**: ⚠️ Board access check disabled
6. **Security Misconfiguration**: ⚠️ Some checks commented out
7. **XSS**: ✅ React escapes by default
8. **Insecure Deserialization**: ✅ Using JSON, validated
9. **Using Components with Known Vulnerabilities**: ⚠️ Keep dependencies updated
10. **Insufficient Logging**: ⚠️ Limited logging implemented

## Compliance Considerations

### Data Privacy

**User Data**:
- Stored in Convex database
- Accessible to organization members
- No explicit privacy policy in code

**Recommendations**:
- Add privacy policy
- Implement data export
- Implement data deletion
- GDPR compliance if applicable

### Data Retention

**Current State**:
- No automatic data deletion
- Boards persist indefinitely
- Favorites persist indefinitely

**Recommendations**:
- Add data retention policy
- Implement cleanup for deleted boards
- Add user data deletion

## Security Checklist

### Before Production

- [ ] Enable board access check in Liveblocks auth
- [ ] Add rate limiting
- [ ] Implement error logging
- [ ] Add CSP headers
- [ ] Review all environment variables
- [ ] Rotate all secrets
- [ ] Enable audit logging
- [ ] Add input size validation
- [ ] Review dependencies for vulnerabilities
- [ ] Set up monitoring and alerts

### Ongoing

- [ ] Regular dependency updates
- [ ] Security audits
- [ ] Monitor for suspicious activity
- [ ] Review access logs
- [ ] Rotate secrets periodically
- [ ] Keep documentation updated

## Incident Response

### If Security Breach Suspected

1. **Immediate Actions**:
   - Rotate all secrets
   - Review access logs
   - Identify affected users/boards
   - Disable affected accounts if needed

2. **Investigation**:
   - Review audit logs
   - Check for unauthorized access
   - Identify attack vector
   - Document findings

3. **Remediation**:
   - Fix vulnerability
   - Notify affected users
   - Update security measures
   - Update documentation

## Resources

- [Clerk Security](https://clerk.com/docs/security)
- [Convex Security](https://docs.convex.dev/security)
- [Liveblocks Security](https://liveblocks.io/docs/guides/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

