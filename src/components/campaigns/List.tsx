"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState, useRef } from "react"
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
    at_a_glance?: boolean
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

  // Track initial render to prevent URL push on mount (which would override /campaigns/new)
  const isInitialRender = useRef(true)

  const fetchCampaigns = useCallback(
    async filters => {
      try {
        console.log("🔄 Fetching campaigns with filters:", filters)
        const response = await client.getCampaigns(filters)
        console.log("✅ Campaigns API response:", response.data)
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
        console.error("❌ Fetch campaigns error:", error)
        console.error("Error details:", error.response?.data || error.message)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to campaign updates using campaignData (same pattern as factions)
  useEffect(() => {
    if (!campaignData) return
    if (campaignData.campaigns === "reload") {
      // Use cache_buster for WebSocket-triggered reloads
      fetchCampaigns({ ...filters, cache_buster: "true" })
    }
  }, [campaignData, fetchCampaigns, filters])

  // Also keep the subscribeToEntity pattern for backwards compatibility
  useEffect(() => {
    const unsubscribe = subscribeToEntity("campaigns", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchCampaigns({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchCampaigns, filters])

  useEffect(() => {
    // Skip URL push on initial render to preserve /campaigns/new route
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const url = `/campaigns?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchCampaigns(filters)
  }, [filters, fetchCampaigns, router, viewMode])

  // Listen for campaign creation events to refresh the list
  useEffect(() => {
    const handleCampaignCreated = () => {
      console.log(
        "📢 Campaign created event received, refreshing list with cache buster..."
      )
      // Add cache_buster to force fresh data after campaign creation
      fetchCampaigns({ ...formState.data.filters, cache_buster: "true" })
    }

    window.addEventListener("campaignCreated", handleCampaignCreated)

    return () => {
      window.removeEventListener("campaignCreated", handleCampaignCreated)
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
