/**
 * Normalizes an entity-like argument into a plain ID string.
 * Accepts entity objects with `id`, string IDs, or undefined.
 */
export function getEntityId(
  entity?: { id?: string } | string
): string | undefined {
  if (!entity) return undefined
  if (typeof entity === "string") return entity
  return (entity as { id?: string }).id
}
