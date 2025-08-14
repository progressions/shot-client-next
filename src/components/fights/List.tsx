"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
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
    unstarted: boolean
    unended: boolean
    ended: boolean
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

  const fetchFights = useCallback(
    async filters => {
      try {
        const response = await client.getFights({ ...filters })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "fights",
          value: response.data.fights,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "seasons",
          value: response.data.seasons,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch fights error:", error)
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
    const url = `/fights?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
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
          mb: 2,
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
