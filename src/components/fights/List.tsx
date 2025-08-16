"use client"
import { useRouter } from "next/navigation"
import { useRef, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Fight, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/fights"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  fights: Fight[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    page: number
    season: number
    status: "Started" | "Unended" | "Ended"
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

  // Set initial data on mount
  useEffect(() => {
    console.log("List initialFormData:", initialFormData)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: initialFormData.fights
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "seasons",
      value: initialFormData.seasons
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "meta",
      value: initialFormData.meta
    })
  }, [initialFormData, dispatchForm])

  const fetchFights = useCallback(
    async filters => {
      console.log("fetchFights - isFetching.current:", isFetching.current)
      if (isFetching.current) return
      isFetching.current = true
      try {
        const response = await client.getFights({ ...filters })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "fights",
          value: response.data.fights
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "seasons",
          value: response.data.seasons
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta
        })
      } catch (error) {
        console.error("Fetch fights error:", error)
      } finally {
        isFetching.current = false
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.fights === "reload") {
      fetchFights(filters)
    }
  }, [campaignData, fetchFights, filters])

  useEffect(() => {
    console.log("Filters useEffect - filters:", filters, "isInitialRender.current:", isInitialRender.current)
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const url = `/fights?${queryParams(filters)}`
    router.push(url, {
      scroll: false
    })
    fetchFights(filters)
  }, [filters, fetchFights, router])

  useEffect(() => {
    saveLocally("fightViewMode", viewMode)
  }, [viewMode, saveLocally])

  return (
    <>
      <Menu viewMode={viewMode} setViewMode={setViewMode} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <MainHeader title="Fights" icon={<Icon keyword="Fights" size="36" />} />
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
