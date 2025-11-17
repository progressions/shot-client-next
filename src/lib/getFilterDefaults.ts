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
 * Applies default filter values to params object
 * @param params - The current params object
 * @param entityName - The name of the entity (e.g., "Fight", "Character")
 * @returns Params with defaults applied for any missing values
 */
export function applyFilterDefaults(
  params: Record<string, unknown>,
  entityName: string
): Record<string, unknown> {
  const defaults = getFilterDefaults(entityName)

  return {
    ...params,
    ...Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        params[key] || value,
      ])
    ),
  }
}
