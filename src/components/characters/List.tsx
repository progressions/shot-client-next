"use client"
import { useRouter } from "next/navigation"
import { useMemo, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Character, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/characters"

interface ListProps {
  initialCharacters: Character[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile: boolean
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
type ValidOrder = "asc" | "desc"

type FormStateData = {
  characters: Character[]
  meta: PaginationMeta
  sort: string
  order: string
  character_type: string
  archetype: string
  faction_id: string
}

export default function List({
  initialCharacters,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { saveLocally, getLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    (getLocally("characterViewMode") as "table" | "mobile") ||
      (initialIsMobile ? "mobile" : "table")
  )
  const { formState, dispatchForm } = useForm<FormStateData>({
    characters: initialCharacters,
    meta: initialMeta,
    sort: initialSort,
    order: initialOrder,
    character_type: "",
    archetype: "",
    faction_id: "",
  })
  const { meta, sort, order, character_type, archetype, faction_id } =
    formState.data

  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchCharacters = useCallback(
    async (
      page: number = 1,
      sort: string = "name",
      order: string = "asc",
      character_type: string = "",
      faction_id: string = "",
      archetype: string = ""
    ) => {
      try {
        const response = await client.getCharacters({
          archetype,
          page,
          sort,
          order,
          type: character_type,
          faction_id,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "characters",
          value: response.data.characters,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch characters error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.characters === "reload") {
      fetchCharacters(
        meta.current_page,
        sort,
        order,
        character_type,
        faction_id,
        archetype
      )
    }
  }, [
    meta.current_page,
    client,
    campaignData,
    dispatchForm,
    fetchCharacters,
    validOrders,
    archetype,
    faction_id,
    character_type,
    sort,
    order,
  ])

  useEffect(() => {
    const url = `/characters?${queryParams({
      page: 1,
      sort,
      order,
      type: character_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchCharacters(1, sort, order, character_type, faction_id, archetype)
  }, [
    character_type,
    archetype,
    faction_id,
    fetchCharacters,
    order,
    router,
    sort,
  ])

  useEffect(() => {
    saveLocally("characterViewMode", viewMode)
  }, [viewMode, saveLocally])

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      const url = `/characters?${queryParams({
        page: 1,
        sort,
        order,
        type: character_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchCharacters(1, sort, order)
    } else {
      const url = `/characters?${queryParams({
        page,
        sort,
        order,
        type: character_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchCharacters(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/characters?${queryParams({
      page: 1,
      sort: newSort,
      order: newOrder,
      type: character_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchCharacters(1, newSort, newOrder)
  }

  return (
    <>
      <Menu viewMode={viewMode} setViewMode={setViewMode} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <MainHeader
          title="Characters"
          icon={<Icon keyword="Characters" size="36" />}
        />
      </Box>
      <View
        viewMode={viewMode}
        formState={formState}
        dispatchForm={dispatchForm}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onOrderChange={() => handleSortChange(sort as ValidSort)}
        initialIsMobile={initialIsMobile}
      />
    </>
  )
}
