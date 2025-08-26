"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Faction, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/factions"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  factions: Faction[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
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

  const fetchFactions = useCallback(
    async filters => {
      try {
        const response = await client.getFactions(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "factions",
          value: response.data.factions,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch factions error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to faction updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("factions", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchFactions({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchFactions, filters])

  useEffect(() => {
    const url = `/factions?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchFactions(filters)
  }, [filters, fetchFactions, router, viewMode])

  useEffect(() => {
    saveLocally("factionViewMode", viewMode)
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
          title="Factions"
          icon={<Icon keyword="Factions" size="36" />}
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
