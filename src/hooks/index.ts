/**
 * Hooks Module
 *
 * Custom React hooks for common application patterns.
 * Provides reusable logic for entity CRUD, filtering, and more.
 *
 * @module hooks
 *
 * @example
 * ```tsx
 * import { useEntity, useEntityFilters } from "@/hooks"
 *
 * // Entity CRUD operations
 * const { updateEntity, deleteEntity } = useEntity(character, dispatchForm)
 *
 * // URL-synced filters
 * const { filters, updateFilters } = useEntityFilters({ filterConfigs, basePath })
 * ```
 */

export * from "@/hooks/useEntity"
export * from "@/hooks/useEntityFilters"
