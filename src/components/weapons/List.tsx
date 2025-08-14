"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Weapon, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/weapons"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  weapons: Weapon[]
  junctures: string[]
  categories: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    page: number
    search: string
    category: string
    juncture: string
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

  const fetchWeapons = useCallback(
    async filters => {
      try {
        const response = await client.getWeapons(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "weapons",
          value: response.data.weapons,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "junctures",
          value: response.data.junctures,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "categories",
          value: response.data.categories,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch weapons error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.weapons === "reload") {
      fetchWeapons(filters)
    }
  }, [campaignData, fetchWeapons, filters])

  useEffect(() => {
    const url = `/weapons?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchWeapons(filters)
  }, [filters, fetchWeapons, router])

  useEffect(() => {
    saveLocally("weaponViewMode", viewMode)
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
          title="Weapons"
          icon={<Icon keyword="Weapons" size="36" />}
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
