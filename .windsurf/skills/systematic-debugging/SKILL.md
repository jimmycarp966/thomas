---
name: systematic-debugging
description: Systematic approach to debugging and root cause analysis. Use when troubleshooting bugs, errors, or unexpected behavior.
---

# Systematic Debugging Skill

When debugging issues, follow this systematic approach:

## Phase 1: Understand the Problem

### Gather Information
1. **Reproduce the issue** - Can you consistently reproduce it?
2. **Identify symptoms** - What exactly is happening vs. what should happen?
3. **Check error messages** - Read console logs, error messages, stack traces
4. **Identify scope** - Is this affecting one component, multiple, or the entire app?

### Questions to Answer
- When did this start happening?
- What changed recently (code, dependencies, environment)?
- Does it happen in all environments (dev, staging, prod)?
- Does it happen for all users or specific ones?

## Phase 2: Isolate the Problem

### Binary Search Approach
1. **Narrow down location** - Which file/component is causing the issue?
2. **Comment out code** - Temporarily disable sections to isolate
3. **Test in isolation** - Create minimal reproduction case
4. **Check dependencies** - Is it caused by a library or your code?

### Tools to Use
- `console.log()` / `console.error()` for quick debugging
- Browser DevTools (Network, Console, Elements)
- React DevTools for component state
- Supabase logs for database issues

## Phase 3: Formulate Hypothesis

### Create Hypothesis
Based on evidence, form a specific hypothesis:
- "The issue is caused by X because Y"
- "The bug happens when Z condition is met"

### Test Hypothesis
1. **Make a prediction** - "If I change X, then Y should happen"
2. **Implement change** - Make minimal change to test
3. **Verify result** - Did it fix the issue?

## Phase 4: Fix the Issue

### Fix Strategy
1. **Address root cause** - Don't just patch symptoms
2. **Make minimal changes** - Smallest fix that solves the problem
3. **Add regression test** - Prevent this bug from happening again
4. **Document the fix** - Explain what was wrong and why

### Fix Types
- **Logic error** - Incorrect algorithm or condition
- **State management** - Wrong state updates
- **Async issue** - Race condition or missing await
- **Type error** - Wrong type usage
- **Dependency issue** - Outdated or incompatible package

## Phase 5: Verify and Test

### Verification Steps
1. **Test the fix** - Verify the issue is resolved
2. **Test edge cases** - Check related scenarios
3. **Run tests** - Ensure no regressions
4. **Check performance** - Fix didn't introduce performance issues

### Common Issues to Check

### Async/Await Issues
```typescript
// ❌ Missing await
async function getData() {
  const result = fetch('/api/data'); // Missing await
  return result.json(); // Will fail
}

// ✅ Correct
async function getData() {
  const response = await fetch('/api/data');
  return response.json();
}
```

### State Management Issues
```typescript
// ❌ Direct mutation
const [items, setItems] = useState([]);
items.push newItem; // Wrong

// ✅ Correct
const [items, setItems] = useState([]);
setItems([...items, newItem]); // Correct
```

### Type Errors
```typescript
// ❌ Using any
function process(data: any) {
  return data.value; // No type safety
}

// ✅ Correct
interface Data {
  value: string;
}

function process(data: Data) {
  return data.value; // Type safe
}
```

## Phase 6: Document and Learn

### Documentation
1. **Update code comments** - Explain the fix
2. **Update tests** - Add regression test
3. **Update documentation** - If it affects API/docs
4. **Create bug report** - For tracking

### Learning
1. **Root cause analysis** - Why did this happen?
2. **Prevention** - How can we prevent this in the future?
3. **Process improvement** - Should we update our workflow?

## Debugging Checklist

Before declaring a bug fixed:
- [ ] Issue is consistently reproducible
- [ ] Root cause is identified
- [ ] Fix addresses root cause (not just symptoms)
- [ ] Regression test is added
- [ ] All existing tests still pass
- [ ] Edge cases are tested
- [ ] Fix is documented
- [ ] Performance is not degraded

## Common Debugging Scenarios

### Scenario 1: Component Not Rendering
1. Check if component is exported
2. Check if it's imported correctly
3. Check for syntax errors
4. Check console for errors
5. Verify props are passed correctly

### Scenario 2: Data Not Loading
1. Check network tab for failed requests
2. Check API endpoint is correct
3. Check authentication/authorization
4. Check database connection
5. Check for CORS issues

### Scenario 3: State Not Updating
1. Check state initialization
2. Check setState is called correctly
3. Check for stale closures
4. Check for async issues
5. Verify re-render is triggered

### Scenario 4: Performance Issues
1. Use React DevTools Profiler
2. Check for unnecessary re-renders
3. Check for large bundle sizes
4. Check for memory leaks
5. Optimize with memo/useMemo/useCallback

## Tools and Commands

### Browser DevTools
- **Console**: Check for errors and logs
- **Network**: Check API requests
- **Elements**: Inspect DOM and styles
- **Performance**: Profile performance

### React DevTools
- **Components**: Inspect component tree and state
- **Profiler**: Measure component performance

### Supabase
- **Logs**: Check database and function logs
- **Table Editor**: Inspect data
- **SQL Editor**: Run queries

### VS Code
- **Debug Panel**: Set breakpoints and step through code
- **Problems Panel**: Check for errors and warnings

## Best Practices

1. **Start simple** - Don't overcomplicate initial investigation
2. **Change one thing at a time** - Isolate variables
3. **Keep notes** - Document what you've tried
4. **Ask for help** - If stuck, get fresh perspective
5. **Learn from mistakes** - Improve process for next time
