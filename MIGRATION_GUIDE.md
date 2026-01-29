# Migration Guide: Legacy to New Architecture

## Overview
This guide helps you migrate existing code to the new refactored architecture while maintaining backward compatibility.

## Quick Start

### 1. Understanding the New Structure
```
src/
├── api/
│   ├── repositories/     # Database operations (BaseRepository, LojaRepository)
│   └── routes/          # API endpoints (modern Next.js App Router)
├── components/
│   ├── ui/              # Reusable UI components
│   ├── business/        # Business logic components (LojasDashboard)
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks (useApi, usePaginatedApi)
├── services/            # Business logic (LojaService)
├── types/               # TypeScript definitions
└── utils/               # Utility functions (api-utils, image-utils)
```

### 2. Migration Patterns

#### Pattern A: API Route Migration
**Before (Legacy):**
```typescript
// pages/api/lojas/index.ts
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const lojas = await prisma.loja.findMany({
        include: {
          equipamentosLoja: true,
          sensores: true,
          atuadores: true
        }
      });
      res.status(200).json(lojas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**After (New Architecture):**
```typescript
// src/api/routes/lojas/route.ts
import { lojaService } from '@/src/services/LojaService';
import { sendJsonResponse, sendErrorResponse } from '@/src/utils/api-utils';

export async function GET(request: Request) {
  try {
    const lojas = await lojaService.getAllLojasWithStats();
    return sendJsonResponse(request, lojas);
  } catch (error: any) {
    return sendErrorResponse(
      request,
      error.message,
      error.status,
      error.code
    );
  }
}
```

#### Pattern B: Component Migration
**Before (Legacy):**
```typescript
// Traditional component with manual data fetching
import { useState, useEffect } from 'react';

function LojasList() {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLojas = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/lojas');
        const data = await response.json();
        setLojas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLojas();
  }, []);

  // Render logic...
}
```

**After (New Architecture):**
```typescript
// Modern component using custom hooks
import { useApi } from '@/src/hooks/useApi';
import { lojaService } from '@/src/services/LojaService';

function LojasList() {
  const {
    data: lojas,
    loading,
    error,
    refetch
  } = useApi(() => lojaService.getAllLojasWithStats());

  // Render logic - much cleaner!
}
```

#### Pattern C: Database Operation Migration
**Before (Direct Prisma):**
```typescript
// In API route or component
const loja = await prisma.loja.findUnique({
  where: { id: lojaId },
  include: {
    equipamentosLoja: true,
    sensores: true,
    atuadores: true
  }
});
```

**After (Repository Pattern):**
```typescript
// Using repository
import { lojaRepository } from '@/src/api/repositories/LojaRepository';

const loja = await lojaRepository.findByIdWithRelations(lojaId);
```

## Step-by-Step Migration Process

### Phase 1: Start Small
1. Choose one simple API route to migrate
2. Create the equivalent in `src/api/routes/`
3. Test both versions work independently
4. Update one component to use the new route
5. Verify functionality before proceeding

### Phase 2: Component Updates
1. Identify components using the migrated API
2. Replace manual data fetching with `useApi` hook
3. Update error handling to use new error structures
4. Test component functionality

### Phase 3: Repository Integration
1. For complex database operations, create repository methods
2. Move business logic from API routes to services
3. Use repositories instead of direct Prisma calls
4. Implement proper error handling

## Best Practices

### 1. Maintain Backward Compatibility
- Keep old routes functioning during transition
- Use feature flags or versioning for gradual rollout
- Test thoroughly before removing legacy code

### 2. Leverage New Features
- Use standardized error handling
- Implement pagination where appropriate
- Utilize built-in caching mechanisms
- Apply consistent response formats

### 3. Testing Strategy
- Test new routes independently
- Verify data integrity between old and new
- Check performance improvements
- Validate error handling scenarios

## Common Migration Scenarios

### Scenario 1: Simple CRUD Operations
```typescript
// Instead of multiple API routes, use the consolidated approach:
// GET /api/lojas?action=list
// POST /api/lojas?action=create
// PUT /api/lojas?action=update&id=123
// DELETE /api/lojas?id=123
```

### Scenario 2: Complex Queries
```typescript
// Move complex Prisma queries to repositories:
// Before: Complex query in API route
// After: Repository method with proper typing and error handling
```

### Scenario 3: File Uploads
```typescript
// Use the new image utilities:
import { processImageUpload } from '@/src/utils/image-utils';

const result = await processImageUpload(fileBuffer, originalName);
```

## Troubleshooting

### Common Issues:
1. **Import Path Errors**: Use `@/src/` prefix for new imports
2. **Type Mismatches**: Refer to `src/types/index.ts` for standard types
3. **Async/Await Problems**: Ensure proper error handling in async functions
4. **Component Re-rendering**: Use useCallback for API functions in hooks

### Getting Help:
- Review the `LojasDashboard.tsx` for complete examples
- Check `REFACTORING_SUMMARY.md` for architecture overview
- Examine existing repository and service implementations

## Timeline Recommendations

### Week 1-2: Foundation
- Understand new architecture
- Migrate 1-2 simple components
- Set up testing for new patterns

### Week 3-4: Expansion
- Migrate 25% of API routes
- Update related components
- Implement repository patterns

### Week 5-6: Completion
- Migrate remaining routes
- Full component updates
- Performance optimization
- Documentation updates

Remember: This is an incremental process. Take your time to understand each pattern before moving to the next.