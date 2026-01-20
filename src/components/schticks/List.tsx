"use client"
import { useRouter } from "next/navigation"
import { useRef, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Schtick, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/schticks"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  schticks: Schtick[]
  categories: string[]
  paths: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    category: string
    path: string
    page: number
    search?: string
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
  const isInitialRender = useRef(true)

  const fetchSchticks = useCallback(
    async filters => {
      try {
        const response = await client.getSchticks({ ...filters })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "schticks",
          value: response.data.schticks,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "categories",
          value: response.data.categories,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "paths",
          value: response.data.paths,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch schticks error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to schtick updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("schticks", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchSchticks({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchSchticks, filters])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const url = `/schticks?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchSchticks(filters)
  }, [filters, fetchSchticks, router, viewMode])

  useEffect(() => {
    saveLocally("schtickViewMode", viewMode)
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
          title="Schticks"
          icon={<Icon keyword="Schticks" size="36" />}
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
