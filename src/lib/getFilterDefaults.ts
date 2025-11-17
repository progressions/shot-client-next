import { filterConfigs } from "@/lib/filterConfigs"

/**
 * Extracts default filter values from a filter configuration
 * @param entityName - The name of the entity (e.g., "Fight", "Character")
 * @returns Object with field names as keys and their default values
 */
export function getFilterDefaults(
  entityName: string
): Record<string, string | boolean> {
  const config = filterConfigs[entityName]
  if (!config) {
    return {}
  }

  const defaults: Record<string, string | boolean> = {}

  for (const field of config.fields) {
    if ("defaultValue" in field && field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue
    }
  }

  return defaults
}

/**
 * Applies default filter values to params object and removes empty string values
 * @param params - The current params object
 * @param entityName - The name of the entity (e.g., "Fight", "Character")
 * @returns Params with defaults applied and empty strings removed
 */
export function applyFilterDefaults(
  params: Record<string, unknown>,
  entityName: string
): Record<string, unknown> {
  const defaults = getFilterDefaults(entityName)

  // First apply defaults for fields with defined defaultValue
  const withDefaults = {
    ...params,
    ...Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        params[key] || value,
      ])
    ),
  }

  // Remove empty string values to prevent backend casting errors
  // Preserve boolean false and string "false" for show_hidden
  return Object.fromEntries(
    Object.entries(withDefaults).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    )
  )
}
