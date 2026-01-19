---
name: clean-code
description: Coding standards and best practices for writing clean, maintainable code. Use when writing or reviewing any code in the project.
---

# Clean Code Skill

When writing or reviewing code, follow these principles:

## Core Principles

1. **Concise and Direct**: Write code that is easy to understand at a glance
2. **No Verbose Explanations**: Code should be self-documenting
3. **No Over-commenting**: Only comment WHY, not WHAT
4. **No Over-engineering**: Solve the problem, don't overcomplicate it
5. **Self-Documentation**: Every change should be documented in relevant .md files

## Code Quality Standards

### Naming
- Use descriptive variable and function names
- Follow language conventions (camelCase for JS/TS, snake_case for SQL)
- Avoid abbreviations unless widely known

### Functions
- Small, focused functions (single responsibility)
- Maximum 20-30 lines per function
- Pure functions when possible
- Avoid side effects

### TypeScript
- Strict mode (no `any`)
- Proper type definitions
- Interfaces for object shapes
- Type guards for runtime checks

## Testing Mandate

### Testing Pyramid
1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test interactions between modules
3. **E2E Tests**: Test complete user flows

### AAA Pattern
- **Arrange**: Setup test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify expected outcome

## Performance Mandate

### General Rule
"Measure first, optimize second"

### Web Performance
- Core Web Vitals < 2.5s
- Optimize bundle size
- Lazy load components when appropriate
- Use React Server Components by default

### Database Performance
- Optimize queries (use indexes)
- Avoid N+1 queries
- Use connection pooling
- Cache frequently accessed data

## Security Mandate

### Never Expose
- API keys in frontend code
- Secrets in client-side code
- Sensitive data in logs

### Always
- Validate all user inputs
- Use environment variables for secrets
- Implement proper authentication
- Use RLS policies in Supabase

## Documentation

Every change must be documented:
- Update README.md for new features
- Update ARCHITECTURE.md for architectural changes
- Add comments for complex logic (WHY, not WHAT)
- Keep changelog in MEJORAS_IMPLEMENTADAS.md

## Examples

### ❌ Bad Code
```typescript
// This function gets the user data
async function get(u: string) {
  const d = await db.query('SELECT * FROM users WHERE id = ?', [u]);
  return d[0];
}
```

### ✅ Good Code
```typescript
async function getUserById(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return data;
}
```

## Checklist

Before committing code, verify:
- [ ] Code is concise and readable
- [ ] Functions are small and focused
- [ ] TypeScript types are correct (no `any`)
- [ ] Tests are written (AAA pattern)
- [ ] Performance is considered
- [ ] Security is validated
- [ ] Documentation is updated
