"use client"
import { useRouter } from "next/navigation"
import { useRef, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Character, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/characters"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  characters: Character[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    character_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
  }
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters } = formState.data
  const isFetching = useRef(false)
  const isInitialRender = useRef(true)

  const fetchCharacters = useCallback(
    async filters => {
      if (isFetching.current) return
      isFetching.current = true
      try {
        const response = await client.getCharacters(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "characters",
          value: response.data.characters,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "factions",
          value: response.data.factions,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "types",
          value: response.data.types,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "archetypes",
          value: response.data.archetypes,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch characters error:", error)
      } finally {
        isFetching.current = false
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.characters === "reload") {
      fetchCharacters(filters)
    }
  }, [campaignData, fetchCharacters, filters])

  useEffect(() => {
    console.log(
      "Filters useEffect - filters:",
      filters,
      "isInitialRender.current:",
      isInitialRender.current
    )
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const url = `/characters?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchCharacters(filters)
  }, [filters, fetchCharacters, router])

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
