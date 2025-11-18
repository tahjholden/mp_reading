# Performance Optimization Guide

## Database Query Optimization

### Existing Indexes

The following indexes are already in place (see `supabase/migrations/006_create_indexes.sql`):

- `idx_children_parent` - Children by primary parent
- `idx_children_username` - Unique username lookup
- `idx_invitations_token` - Fast token lookup
- `idx_invitations_email` - Email-based invitation lookup
- `idx_onboarding_child` - Onboarding data by child
- `idx_logs_child` - Access logs by child
- `idx_logs_user` - Access logs by user
- `idx_logs_timestamp` - Access logs by timestamp
- `idx_logs_action` - Access logs by action type
- `idx_logs_table` - Access logs by table name

### Query Optimization Recommendations

1. **Use SELECT with specific columns** instead of `SELECT *` when possible
2. **Limit result sets** using `.limit()` for pagination
3. **Use `.single()`** for queries that should return exactly one row
4. **Batch operations** when updating multiple records
5. **Use transactions** for multi-step operations

### Caching Strategy

For future implementation:

1. **Client-side caching**: Cache child profiles and preferences in Svelte stores
2. **API response caching**: Consider caching static data (e.g., reading preferences options)
3. **Database query caching**: Use Supabase's built-in query caching where appropriate

### Performance Monitoring

Monitor the following:
- Query execution times
- Database connection pool usage
- API response times
- Client-side bundle size

## Frontend Performance

### Code Splitting

SvelteKit automatically code-splits routes. Ensure:
- Large components are lazy-loaded when possible
- Third-party libraries are imported only where needed

### Image Optimization

- Use appropriate image formats (WebP when supported)
- Implement lazy loading for images
- Use responsive images with `srcset`

### Bundle Size

- Regularly audit bundle size
- Remove unused dependencies
- Use tree-shaking for large libraries

## API Performance

### Response Times

Target response times:
- Authentication endpoints: < 200ms
- Data retrieval: < 300ms
- Data updates: < 500ms

### Rate Limiting

Consider implementing rate limiting for:
- Authentication endpoints
- Password reset requests
- Data export requests

## Future Optimizations

1. **Database connection pooling**: Already handled by Supabase
2. **CDN for static assets**: Use Supabase Storage CDN
3. **Edge caching**: Consider Vercel Edge Functions for frequently accessed data
4. **Database read replicas**: For high-traffic scenarios



