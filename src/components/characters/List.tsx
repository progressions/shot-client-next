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
  initialFormData: FormStateData
  initialIsMobile: boolean
}

type ValidOrder = "asc" | "desc"

type FormStateData = {
  characters: Character[]
  meta: PaginationMeta
  sort: string
  order: string
  character_type: string
  archetype: string
  faction_id: string
  page: number
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { saveLocally, getLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    (getLocally("characterViewMode") as "table" | "mobile") ||
      (initialIsMobile ? "mobile" : "table")
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  console.log("Form state:", formState)
  const { meta, page, sort, order, character_type, archetype, faction_id } =
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
      page: page,
      sort,
      order,
      type: character_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchCharacters(page, sort, order, character_type, faction_id, archetype)
  }, [
    character_type,
    archetype,
    faction_id,
    fetchCharacters,
    order,
    router,
    sort,
    page,
  ])

  useEffect(() => {
    saveLocally("characterViewMode", viewMode)
  }, [viewMode, saveLocally])

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
        initialIsMobile={initialIsMobile}
      />
    </>
  )
}
