"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Adventure, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/adventures"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  adventures: Adventure[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    page: number
    search: string
    show_hidden?: boolean
    at_a_glance?: boolean
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

  const fetchAdventures = useCallback(
    async filters => {
      try {
        const response = await client.getAdventures(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "adventures",
          value: response.data.adventures,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch adventures error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to adventure updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("adventures", data => {
      if (data === "reload") {
        fetchAdventures({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchAdventures, filters])

  useEffect(() => {
    const url = `/adventures?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchAdventures(filters)
  }, [filters, fetchAdventures, router, viewMode])

  useEffect(() => {
    saveLocally("adventureViewMode", viewMode)
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
          title="Adventures"
          icon={<Icon keyword="Adventures" size="36" />}
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
