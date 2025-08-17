"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Party, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/parties"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  parties: Party[]
  factions: Faction[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    party_type: string
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

  const fetchParties = useCallback(
    async filters => {
      try {
        const response = await client.getParties(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "parties",
          value: response.data.parties,
        })
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
        console.error("Fetch parties error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to party updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("parties", data => {
      if (data === "reload") {
        fetchParties(filters)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchParties, filters])

  useEffect(() => {
    const url = `/parties?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchParties(filters)
  }, [filters, fetchParties, router])

  useEffect(() => {
    saveLocally("partyViewMode", viewMode)
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
          title="Parties"
          icon={<Icon keyword="Parties" size="36" />}
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
