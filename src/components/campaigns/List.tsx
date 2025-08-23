"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Campaign, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/campaigns"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  campaigns: Campaign[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    campaign_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
  }
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { subscribeToEntity, campaignData } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters } = formState.data

  const fetchCampaigns = useCallback(
    async filters => {
      try {
        const response = await client.getCampaigns(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "campaigns",
          value: response.data.campaigns,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch campaigns error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to campaign updates using campaignData (same pattern as factions)
  useEffect(() => {
    if (!campaignData) return
    if (campaignData.campaigns === "reload") {
      fetchCampaigns(filters)
    }
  }, [campaignData, fetchCampaigns, filters])

  // Also keep the subscribeToEntity pattern for backwards compatibility
  useEffect(() => {
    const unsubscribe = subscribeToEntity("campaigns", data => {
      if (data === "reload") {
        fetchCampaigns(filters)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchCampaigns, filters])

  useEffect(() => {
    const url = `/campaigns?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchCampaigns(filters)
  }, [filters, fetchCampaigns, router, viewMode])

  // Listen for campaign creation events to refresh the list
  useEffect(() => {
    const handleCampaignCreated = () => {
      fetchCampaigns(formState.data.filters)
    }

    window.addEventListener('campaignCreated', handleCampaignCreated)
    
    return () => {
      window.removeEventListener('campaignCreated', handleCampaignCreated)
    }
  }, [fetchCampaigns, formState.data.filters])

  useEffect(() => {
    saveLocally("campaignViewMode", viewMode)
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
          title="Campaigns"
          icon={<Icon keyword="Campaigns" size="36" />}
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
