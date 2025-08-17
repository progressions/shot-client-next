"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Juncture, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/junctures"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  junctures: Juncture[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    juncture_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
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

  const fetchJunctures = useCallback(
    async filters => {
      try {
        const response = await client.getJunctures(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "junctures",
          value: response.data.junctures,
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
        console.error("Fetch junctures error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to juncture updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("junctures", data => {
      if (data === "reload") {
        fetchJunctures(filters)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchJunctures, filters])

  useEffect(() => {
    const url = `/junctures?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchJunctures(filters)
  }, [filters, fetchJunctures, router])

  useEffect(() => {
    saveLocally("junctureViewMode", viewMode)
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
          title="Junctures"
          icon={<Icon keyword="Junctures" size="36" />}
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
