const UUID_REGEX =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

export function extractId(slugOrId: string): string {
  const match = slugOrId.match(UUID_REGEX)
  return match ? match[1] : slugOrId
}

export function slugifyName(name?: string | null): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildSluggedId(
  name: string | null | undefined,
  id: string
): string {
  const uuid = extractId(id)
  const slug = slugifyName(name)
  return slug ? `${slug}-${uuid}` : uuid
}

export function sluggedPath(
  entity: string,
  name: string | null | undefined,
  id: string
): string {
  return `/${entity}/${buildSluggedId(name, id)}`
}
