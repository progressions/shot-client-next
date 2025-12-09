/**
 * Contexts Module
 *
 * React Context providers for global application state management.
 * Import contexts and hooks from this module for consistent access patterns.
 *
 * @module contexts
 *
 * @example
 * ```tsx
 * import { useApp, useClient, useCampaign, useToast, useEncounter } from "@/contexts"
 *
 * // Access user and campaign state
 * const { user, campaign, loading } = useApp()
 *
 * // Make API calls
 * const { client } = useClient()
 *
 * // Show notifications
 * const { toastSuccess, toastError } = useToast()
 * ```
 */

// export * from "@/contexts/ClientContext"
// export * from "@/contexts/CampaignContext"
export * from "@/contexts/LocalStorageContext"
export * from "@/contexts/ToastContext"
export * from "@/contexts/EncounterContext"
export * from "@/contexts/AppContext"
