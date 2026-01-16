# Tools Library

This directory contains utilities and infrastructure for the Tools feature.

## Files

- `registry.ts` - Tools registry (single source of truth for all tools)
- `logToolRun.ts` - Tool run logging (stub for now, will connect to Supabase)

## Tool Run Logging

### Usage

When building a tool, integrate `logToolRun` to track executions:

```typescript
import { logToolRunSafe } from '@/lib/tools/logToolRun';

// In your tool's submit/execute handler:
await logToolRunSafe({
  toolId: 'gtm-system-designer',
  studentProfileId: studentProfileId,
  inputs: {
    // Tool-specific input parameters
    targetAudience: 'B2B SaaS',
    budget: 50000,
  },
  outputs: {
    // Tool-generated outputs (can become portfolio artifacts)
    systemMap: '...',
    recommendations: [...],
    artifacts: [...],
  },
});
```

### Integration Pattern

1. **Collect inputs** from your tool's form/UI
2. **Execute tool logic** (generate outputs)
3. **Log the run** using `logToolRunSafe()` (non-blocking)
4. **Display results** to the user

See `components/tools/gtm-system-designer/GTMSystemDesignerClient.tsx` for a complete example.

### Future Implementation

When ready to implement database logging:

1. Create migration from `documentation/TOOL_RUNS_SCHEMA_PLAN.md`
2. Create API endpoint: `/api/tools/runs` (POST)
3. Update `logToolRun.ts` to call the API instead of console.log
4. Tool runs will automatically be stored and can be used for portfolio artifacts
