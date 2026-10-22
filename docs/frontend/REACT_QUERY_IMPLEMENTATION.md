# React Query Implementation

## Problem solved

The web app was issuing **duplicate HTTP requests** to the same endpoints, which caused slow loads, wasted bandwidth, extra backend load, and a poor user experience.

### Example (Dashboard before migration)

Loading the dashboard could trigger:

- 7× `churches`
- 4× `ministries`
- 2× `persons`
- 3× `teams`
- 2× `schedules`
- 2× `services`

**~20 redundant requests** for one page view.

## Solution: TanStack Query (React Query)

We adopted **React Query**, aligned with patterns from the `air-finance-app` project.

### Benefits

1. **Automatic cache keyed by `queryKey`**
2. **Request deduplication** when multiple components share a key
3. **Targeted invalidation** after mutations
4. **Optimistic updates** (where applicable)
5. **DevTools** for cache inspection

## File structure

```
apps/web/src/
├── lib/
│   └── queryClient.ts
├── hooks/
│   └── queries/
│       ├── usePeopleQuery.ts
│       ├── useTeamsQuery.ts
│       ├── useMinistriesQuery.ts
│       ├── useSchedulesQuery.ts
│       ├── useServicesQuery.ts
│       ├── useChurchesQuery.ts
│       ├── useUsersQuery.ts
│       ├── useTeamMembersQuery.ts
│       ├── useMinistryLeadersQuery.ts
│       └── utils/
│           └── queryInvalidations.ts
└── App.tsx                 # QueryClientProvider
```

## Configuration

### `queryClient.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
})
```

### `App.tsx`

```typescript
<QueryClientProvider client={queryClient}>
  {/* app routes */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Usage example

**Before (`usePeople` + `useEffect`):**

```typescript
const { people, fetchPeople, isLoading } = usePeople()
useEffect(() => {
  fetchPeople()
}, [selectedChurch])
```

**After (`usePeopleQuery`):**

```typescript
const { people, isLoading } = usePeopleQuery()
```

## Hook pattern

```typescript
export function usePeopleQuery() {
  const { selectedChurch } = useChurch()
  const queryClient = useQueryClient()

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people', selectedChurch?.id],
    queryFn: () => apiServices.peopleService.getAll(),
    enabled: !!selectedChurch?.id,
  })

  const createMutation = useMutation({
    mutationFn: data => apiServices.peopleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })

  return { people, isLoading, createPerson: createMutation.mutate }
}
```

## Expected results

| Metric | Before | After |
| ------ | ------ | ----- |
| Dashboard requests | ~20 | ~5 |
| Load time | ~2–3 s | ~0.5–1 s |
| Duplicate requests | Many | None (deduped) |

## Implementation status

- QueryClient and provider: done
- Core entity hooks migrated: done
- Components updated: done
- Centralized invalidation helpers: done
- Future: optimistic updates, per-resource cache tuning

## Cache invalidation

### Problem

Manual `invalidateQueries` in every mutation duplicated logic and was easy to miss.

### Solution: `queryInvalidations.ts`

Dependency map example:

```typescript
const ENTITY_DEPENDENCIES: Record<EntityType, EntityType[]> = {
  people: ['teamMembers', 'schedules', 'teams'],
  teams: ['teamMembers', 'schedules', 'ministries'],
  teamMembers: ['teams', 'team', 'people'],
  ministries: ['teams', 'ministryLeaders'],
}
```

Helpers:

- `invalidateEntityQueries`
- `invalidateDependentQueries`
- `invalidateEntityAndDependencies`
- `invalidateAllCompanyQueries`
- `invalidateTeamQueries` / `invalidateMinistryQueries` / `invalidatePersonQueries`

**Before (duplicated):**

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['teamMembers'], exact: false })
  queryClient.invalidateQueries({ queryKey: ['schedules'], exact: false })
  queryClient.invalidateQueries({ queryKey: ['teams'], exact: false })
}
```

**After:**

```typescript
import { invalidatePersonQueries } from './utils/queryInvalidations'

onSuccess: (_updated, { id }) => {
  invalidatePersonQueries(queryClient, { companyId, personId: id })
}
```

Mutations invalidate the entity and related queries consistently.

## References

- [TanStack Query docs](https://tanstack.com/query/latest)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)

---

**Implemented:** January 2026  
**Status:** Production
