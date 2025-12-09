/**
 * ListManager Hooks
 *
 * Custom hooks for the ListManager component that handle:
 * - Child entity ID extraction from parent entities
 * - Child entity data fetching and state management
 * - Optimistic update handlers with rollback
 * - Autocomplete filter state and API integration
 *
 * @module components/ListManager/hooks
 */

export * from "./useChildIds"
export * from "./useChildEntities"
export * from "./useOptimisticManager"
export * from "./useAutocompleteFilters"
