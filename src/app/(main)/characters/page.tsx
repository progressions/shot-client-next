// app/characters/page.tsx
import { List } from "@/components/characters"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { CharactersResponse } from "@/types"

export const metadata = {
  title: "Characters - Chi War",
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    show_hidden?: string
    template_filter?: string
    [key: string]: string | undefined
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Get default filter values for Character entity
  const defaults = getFilterDefaults("Character")

  return (
    <ResourcePage
      resourceName="characters"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Character")
        return client.getCharacters(paramsWithDefaults)
      }}
      validSorts={[
        "name",
        "archetype",
        "faction",
        "juncture",
        "created_at",
        "updated_at",
      ]}
      getInitialFormData={(
        data: CharactersResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        characters: data.characters,
        factions: data.factions,
        archetypes: data.archetypes,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          character_type: additionalParams?.character_type || defaults.character_type || "",
          archetype: additionalParams?.archetype || defaults.archetype || "",
          faction_id: additionalParams?.faction_id || defaults.faction_id || "",
          show_hidden: additionalParams?.show_hidden || defaults.show_hidden || false,
          template_filter: additionalParams?.template_filter || defaults.template_filter || "non-templates",
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
