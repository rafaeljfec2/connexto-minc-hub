import { QueryClient } from '@tanstack/react-query'

/**
 * Centralized query invalidation utilities
 * Maps entity relationships and provides reusable invalidation functions
 */

export type EntityType =
  | 'people'
  | 'person'
  | 'teams'
  | 'team'
  | 'teamMembers'
  | 'ministries'
  | 'ministry'
  | 'ministryLeaders'
  | 'schedules'
  | 'schedule'
  | 'services'
  | 'service'
  | 'users'
  | 'churches'

/**
 * Entity dependency map
 * Defines which queries should be invalidated when an entity changes
 */
const ENTITY_DEPENDENCIES: Record<EntityType, EntityType[]> = {
  people: ['teamMembers', 'schedules', 'teams'],
  person: ['teamMembers', 'schedules', 'teams'],
  teams: ['teamMembers', 'schedules', 'ministries'],
  team: ['teamMembers', 'schedules'],
  teamMembers: ['teams', 'team', 'people'],
  ministries: ['teams', 'ministryLeaders'],
  ministry: ['teams', 'ministryLeaders'],
  ministryLeaders: ['ministries', 'people'],
  schedules: ['teams', 'services'],
  schedule: ['teams', 'services'],
  services: ['schedules'],
  service: ['schedules'],
  users: ['person', 'people'],
  churches: ['people', 'teams', 'ministries', 'schedules', 'services', 'users'],
}

/**
 * Invalidates queries for a given entity type
 */
export function invalidateEntityQueries(
  queryClient: QueryClient,
  entityType: EntityType,
  options?: { exact?: boolean; companyId?: string; id?: string }
): void {
  const { exact = false, companyId, id } = options ?? {}

  // Build query key based on entity type
  let queryKey: unknown[]
  if (id && companyId) {
    // Specific entity query (e.g., ['person', companyId, id])
    queryKey = [entityType, companyId, id]
  } else if (companyId) {
    // List query with companyId (e.g., ['people', companyId])
    queryKey = [entityType, companyId]
  } else {
    // List query without companyId (e.g., ['churches'])
    queryKey = [entityType]
  }

  queryClient.invalidateQueries({ queryKey, exact })
}

/**
 * Invalidates all dependent queries for a given entity type
 */
export function invalidateDependentQueries(
  queryClient: QueryClient,
  entityType: EntityType,
  options?: { exact?: boolean }
): void {
  const { exact = false } = options ?? {}
  const dependencies = ENTITY_DEPENDENCIES[entityType] ?? []

  dependencies.forEach(dep => {
    queryClient.invalidateQueries({ queryKey: [dep], exact })
  })
}

/**
 * Invalidates both the entity and its dependencies
 */
export function invalidateEntityAndDependencies(
  queryClient: QueryClient,
  entityType: EntityType,
  options?: { exact?: boolean; companyId?: string; id?: string }
): void {
  // Invalidate the entity itself
  invalidateEntityQueries(queryClient, entityType, options)

  // Invalidate dependencies
  invalidateDependentQueries(queryClient, entityType, { exact: options?.exact ?? false })
}

/**
 * Invalidates all queries that depend on companyId (church context)
 */
export function invalidateAllCompanyQueries(queryClient: QueryClient): void {
  const companyDependentEntities: EntityType[] = [
    'people',
    'teams',
    'ministries',
    'schedules',
    'services',
    'users',
  ]

  companyDependentEntities.forEach(entity => {
    queryClient.invalidateQueries({ queryKey: [entity], exact: false })
  })
}

/**
 * Invalidates team-related queries for a specific team
 */
export function invalidateTeamQueries(
  queryClient: QueryClient,
  teamId: string,
  options?: { companyId?: string }
): void {
  const { companyId } = options ?? {}

  queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId], exact: false })
  queryClient.invalidateQueries({ queryKey: ['teams'], exact: false })

  if (companyId) {
    queryClient.invalidateQueries({ queryKey: ['team', companyId, teamId] })
  }
}

/**
 * Invalidates ministry-related queries for a specific ministry
 */
export function invalidateMinistryQueries(
  queryClient: QueryClient,
  ministryId: string,
  options?: { companyId?: string }
): void {
  const { companyId } = options ?? {}

  queryClient.invalidateQueries({ queryKey: ['ministryLeaders', ministryId], exact: false })
  queryClient.invalidateQueries({ queryKey: ['teams'], exact: false })

  if (companyId) {
    queryClient.invalidateQueries({ queryKey: ['ministry', companyId, ministryId] })
  }
}

/**
 * Invalidates person-related queries
 */
export function invalidatePersonQueries(
  queryClient: QueryClient,
  options?: { companyId?: string; personId?: string }
): void {
  const { companyId, personId } = options ?? {}

  queryClient.invalidateQueries({ queryKey: ['teamMembers'], exact: false })
  queryClient.invalidateQueries({ queryKey: ['schedules'], exact: false })
  queryClient.invalidateQueries({ queryKey: ['teams'], exact: false })

  if (companyId && personId) {
    queryClient.invalidateQueries({ queryKey: ['person', companyId, personId] })
  }
}
