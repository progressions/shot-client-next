"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Site, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/sites"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  sites: Site[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    site_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
    show_hidden?: boolean
  }
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters } = formState.data

  console.log("formState", formState?.data?.sites)

  const fetchSites = useCallback(
    async filters => {
      try {
        const response = await client.getSites(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "sites",
          value: response.data.sites,
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
        console.error("Fetch sites error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to site updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("sites", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchSites({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchSites, filters])

  useEffect(() => {
    const url = `/sites?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchSites(filters)
  }, [filters, fetchSites, router, viewMode])

  useEffect(() => {
    saveLocally("siteViewMode", viewMode)
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
        <MainHeader title="Sites" icon={<Icon keyword="Sites" size="36" />} />
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
