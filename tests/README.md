# Testing Guide

This guide explains how to set up and run tests for the reading app.

## Prerequisites

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
TEST_BASE_URL=http://localhost:5173
```

**Important**: 
- Use a **separate Supabase project** for testing (not production)
- The `TEST_BASE_URL` should point to your running dev server
- Get these values from your Supabase project dashboard → Settings → API

### 2. Database Setup

Ensure all migrations have been applied to your test Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply migrations from supabase/migrations/
```

### 3. Running the Dev Server

Tests require a running SvelteKit dev server. Start it in one terminal:

```bash
npm run dev
# or
pnpm dev
```

The server should be running at `http://localhost:5173`.

## Running Tests

### Run All Tests

```bash
npm test
# or
pnpm test
```

### Run Specific Test Files

```bash
# Run contract tests
npm test tests/contract

# Run integration tests
npm test tests/integration

# Run a specific test file
npm test tests/integration/catalog-browse-flow.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Test Structure

### Contract Tests (`tests/contract/`)

Test API endpoints and their contracts:
- Request/response formats
- Status codes
- Error handling
- Authentication requirements

**Example**: `books-list.test.ts` tests the `/api/books` endpoint contract.

### Integration Tests (`tests/integration/`)

Test complete user flows:
- Authentication flows
- Catalog browsing
- Book detail viewing
- Filtering and search

**Example**: `catalog-browse-flow.test.ts` tests the complete catalog browsing experience.

### E2E Tests (`tests/e2e/`)

End-to-end tests using Playwright (browser automation):
- Full user journeys
- UI interactions
- Cross-browser testing

## Test User Setup

### Automatic Test User Creation

Tests automatically create users in `beforeAll` hooks and clean them up in `afterAll` hooks. Each test uses unique email addresses with timestamps to avoid conflicts.

### Using Test Helpers

For custom test scenarios, use the test utilities:

```typescript
import { createTestParent, createTestChild, cleanupTestParent } from './utils/test-helpers';

describe('My Test', () => {
  let parent: TestParent;
  let child: TestChild;

  beforeAll(async () => {
    // Create test parent
    parent = await createTestParent();
    
    // Create test child
    child = await createTestChild(parent.id);
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestParent(parent.id);
  });

  it('should do something', async () => {
    // Use parent.authToken for authenticated requests
    const response = await fetch(`${BASE_URL}/api/books`, {
      headers: {
        Authorization: `Bearer ${parent.authToken}`
      }
    });
  });
});
```

### Test User Credentials

Test users are created with these default credentials:
- **Parent**: `test-parent-{timestamp}@example.com` / `TestParent123!`
- **Child**: `test-child-{timestamp}` / `TestChild123!`

You can customize these when using test helpers.

## Test Data Cleanup

### Automatic Cleanup

Most tests clean up their data in `afterAll` hooks. However, if tests fail or are interrupted, test data may remain in the database.

### Manual Cleanup

If you need to clean up test data manually:

1. **Via Supabase Dashboard**:
   - Go to your test project dashboard
   - Navigate to Table Editor
   - Delete test records manually

2. **Via SQL**:
   ```sql
   -- Delete test parents (be careful!)
   DELETE FROM parents WHERE email LIKE 'test-%@example.com';
   
   -- Delete test children
   DELETE FROM children WHERE username LIKE 'test-%';
   
   -- Delete test books
   DELETE FROM books WHERE title LIKE 'Test%' OR title LIKE '%Test%';
   ```

3. **Via Test Helper**:
   ```typescript
   import { cleanupTestParent } from './utils/test-helpers';
   await cleanupTestParent(parentId);
   ```

## Common Issues

### Tests Failing with "Authentication Required"

**Problem**: Tests are failing with 401 errors.

**Solutions**:
1. Ensure `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set correctly
2. Verify the dev server is running at `TEST_BASE_URL`
3. Check that test users are being created successfully (add console.logs)

### Tests Failing with Database Errors

**Problem**: Tests fail with foreign key constraint or RLS policy errors.

**Solutions**:
1. Ensure all migrations are applied
2. Check RLS policies are set up correctly
3. Verify test users have proper relationships (child → parent)

### Tests Creating Duplicate Users

**Problem**: Tests fail because users already exist.

**Solutions**:
1. Clean up old test data (see Manual Cleanup above)
2. Tests use timestamps to avoid conflicts, but if you're running tests in parallel, you may need to add more randomness

### Environment Variables Not Loading

**Problem**: Tests can't find `PUBLIC_SUPABASE_URL` or other env vars.

**Solutions**:
1. Ensure `.env` file exists in project root
2. Check `vite.config.js` is loading env vars correctly
3. Restart your test runner after changing `.env`

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `afterAll` hooks
3. **Unique Data**: Use timestamps or UUIDs to ensure unique test data
4. **Error Handling**: Test both success and error cases
5. **Assertions**: Be specific with assertions - test exact values when possible

## Continuous Integration

For CI/CD pipelines:

1. Set up a dedicated Supabase test project
2. Configure environment variables in your CI platform
3. Run migrations before tests
4. Clean up test data after test runs

Example GitHub Actions workflow:

```yaml
- name: Run tests
  env:
    PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  run: npm test
```

## Need Help?

- Check existing test files for examples
- Review the test helpers in `tests/utils/test-helpers.ts`
- Check Supabase documentation for auth and database setup
- Review error messages carefully - they often indicate the issue

