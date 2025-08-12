"use client"
import { useRouter } from "next/navigation"
import { useMemo, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import type { Entity, PaginationMeta } from "@/types"

interface FormStateData {
  entities: Entity[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    page: number
    category: string
    juncture: string
  }
}

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

type ValidOrder = "asc" | "desc"

interface CreateListComponentProps {
  entityName: string
  MenuComponent: React.ComponentType<{
    viewMode: "table" | "mobile"
    setViewMode: React.Dispatch<React.SetStateAction<"table" | "mobile">>
  }>
  ViewComponent: React.ComponentType<{
    viewMode: "table" | "mobile"
    formState: { data: FormStateData }
    dispatchForm: (action: {
      type: string
      name?: string
      value?: unknown
    }) => void
    initialIsMobile: boolean
  }>
}

export function createListComponent({
  entityName,
  MenuComponent,
  ViewComponent,
}: CreateListComponentProps) {
  const componentName = `${entityName}List`

  return function List({ initialFormData, initialIsMobile }: ListProps) {
    const { client } = useClient()
    const { campaignData } = useCampaign()
    const { saveLocally } = useLocalStorage()
    const router = useRouter()
    const [viewMode, setViewMode] = useState<"table" | "mobile">(
      initialIsMobile ? "mobile" : "table"
    )
    const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
    const { filters, meta } = formState.data
    const validOrders: readonly ValidOrder[] = useMemo(
      () => ["asc", "desc"],
      []
    )
    const fetchEntities = useCallback(
      async filters => {
        try {
          const response = await client[`get${entityName}`]({ ...filters })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "entities",
            value: response.data[entityName.toLowerCase()],
          })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "meta",
            value: response.data.meta,
          })
        } catch (error) {
          console.error(`Fetch ${entityName.toLowerCase()} error:`, error)
        }
      },
      [client, dispatchForm]
    )
    useEffect(() => {
      if (!campaignData) return
      console.log("Campaign data:", campaignData)
      if (campaignData[entityName.toLowerCase()] === "reload") {
        fetchEntities(filters)
      }
    }, [campaignData, fetchEntities, filters])
    useEffect(() => {
      const url = `/${entityName.toLowerCase()}?${queryParams(filters)}`
      router.push(url, {
        scroll: false,
      })
      fetchEntities(filters)
    }, [filters, fetchEntities, router])
    useEffect(() => {
      saveLocally(`${entityName.toLowerCase()}ViewMode`, viewMode)
    }, [viewMode, saveLocally])
    return (
      <>
        <MenuComponent viewMode={viewMode} setViewMode={setViewMode} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <MainHeader
            title={entityName}
            icon={<Icon keyword={entityName} size="36" />}
          />
        </Box>
        <ViewComponent
          viewMode={viewMode}
          formState={formState}
          dispatchForm={dispatchForm}
          initialIsMobile={initialIsMobile}
        />
      </>
    )
  }
}
