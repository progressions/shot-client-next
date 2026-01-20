"use client"
import { useRouter } from "next/navigation"
import { useRef, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Weapon, PaginationMeta } from "@/types"
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

  // Subscribe to weapon updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("weapons", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchWeapons({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchWeapons, filters])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    const url = `/weapons?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchWeapons(filters)
  }, [filters, fetchWeapons, router, viewMode])

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
