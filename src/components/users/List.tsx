"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { User, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/users"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  users: User[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    user_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
  }
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { campaignData, subscribeToEntity } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters } = formState.data

  const fetchUsers = useCallback(
    async filters => {
      try {
        const response = await client.getUsers(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "users",
          value: response.data.users,
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
        console.error("Fetch users error:", error)
      }
    },
    [client, dispatchForm]
  )

  // Subscribe to user updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("users", data => {
      if (data === "reload") {
        // Use cache_buster for WebSocket-triggered reloads
        fetchUsers({ ...filters, cache_buster: "true" })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchUsers, filters])

  useEffect(() => {
    if (!campaignData) return
    if (campaignData.users === "reload") {
      fetchUsers(filters)
    }
  }, [campaignData, fetchUsers, filters])

  useEffect(() => {
    const url = `/users?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchUsers(filters)
  }, [filters, fetchUsers, router, viewMode])

  useEffect(() => {
    saveLocally("userViewMode", viewMode)
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
        <MainHeader title="Users" icon={<Icon keyword="Users" size="36" />} />
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
