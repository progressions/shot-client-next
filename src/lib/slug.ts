const UUID_REGEX =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * Extracts the trailing UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) from a slugged
 * string like "cool-character-<uuid>". If no UUID is present, returns the input.
 * Accepts bare UUIDs, slug+UUID, or malformed inputs.
 */
export function extractId(slugOrId: string): string {
  const match = slugOrId?.match(UUID_REGEX)
  return match ? match[1] : slugOrId
}

/**
 * Creates a URL-safe slug from a name. Lowercases, decomposes accents, removes
 * combining marks, strips punctuation, collapses whitespace/underscores/dashes,
 * and trims edge dashes. Returns an empty string for null/undefined/empty input.
 */
export function slugifyName(name?: string | null): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Combines a name and UUID into "slug-uuid". If the slug is empty, returns the
 * UUID-only form to preserve legacy compatibility.
 */
export function buildSluggedId(
  name: string | null | undefined,
  id: string
): string {
  const uuid = extractId(id)
  const slug = slugifyName(name)
  return slug ? `${slug}-${uuid}` : uuid
}

/**
 * Builds a full path for an entity collection, accepting either slugged or bare IDs.
 */
export function sluggedPath(
  entity: string,
  name: string | null | undefined,
  id: string
): string {
  return `/${entity}/${buildSluggedId(name, id)}`
}
