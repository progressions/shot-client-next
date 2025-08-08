"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useMediaQuery,
  useTheme,
  Box,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material"
import { FightsControls, FightDetail, FightForm } from "@/components/fights"
import type { Fight, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"

interface FightsProperties {
  initialFights: Fight[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile?: boolean
}

type FormStateData = {
  fights: Fight[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Fights({
  initialFights,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: FightsProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    fights: initialFights,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, fights, drawerOpen, error } = formState.data
  const [selectedFight, setSelectedFight] = useState<Fight | null>(null)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
    defaultMatches: initialIsMobile ?? false,
  })

  type ValidSort = "created_at" | "updated_at" | "name"
  type ValidOrder = "asc" | "desc"
  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchFights = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getFights({ page, sort, order })
        console.log("Fetched fights:", response.data.fights)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "fights",
          value: response.data.fights,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta || { current_page: page, total_pages: 1 },
        })
        dispatchForm({ type: FormActions.ERROR, payload: null })
      } catch (error_: unknown) {
        dispatchForm({
          type: FormActions.ERROR,
          payload:
            error_ instanceof Error ? error_.message : "Failed to fetch fights",
        })
        console.error("Fetch fights error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.fights === "reload") {
      const parameters = new URLSearchParams(globalThis.location.search)
      const page = parameters.get("page")
        ? Number.parseInt(parameters.get("page")!, 10)
        : 1
      const sortParameter = parameters.get("sort")
      const orderParameter = parameters.get("order")
      const currentSort =
        sortParameter && validSorts.includes(sortParameter as ValidSort)
          ? sortParameter
          : "created_at"
      const currentOrder =
        orderParameter && validOrders.includes(orderParameter as ValidOrder)
          ? orderParameter
          : "desc"
      setSort(currentSort)
      setOrder(currentOrder)
      fetchFights(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchFights, validSorts, validOrders])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveFight = async (newFight: Fight) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: [newFight, ...fights],
    })
  }

  const handleDeleteFight = (fightId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: fights.filter(fight => fight.id !== fightId),
    })
    if (selectedFight?.id === fightId) setSelectedFight(null)
    router.refresh()
  }

  const handlePageChange = async (page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/fights?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFights(1, sort, order)
    } else {
      router.push(`/fights?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFights(page, sort, order)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    fetchFights(1, newSort, order)
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    await fetchFights(1, sort, newOrder)
  }

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { xs: 1, sm: 1.5 },
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <FightsControls
            sort={sort}
            order={order}
            page={meta.current_page}
            totalPages={meta.total_pages}
            onSortChange={handleSortChange}
            onOrderChange={handleOrderChange}
            onPageChange={handlePageChange}
          >
            <Box my={2}>
              {fights.length === 0 ? (
                <Typography variant="body1" sx={{ color: "#ffffff" }}>
                  No fights available
                </Typography>
              ) : (
                fights.map(fight => (
                  <FightDetail
                    key={fight.id}
                    fight={fight}
                    onDelete={handleDeleteFight}
                    isMobile={isMobile}
                  />
                ))
              )}
            </Box>
          </FightsControls>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateDrawer}
            sx={{ px: 2 }}
            aria-label="create new fight"
          >
            New
          </Button>
        </Box>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FightForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        setFight={handleSaveFight}
      />
    </Box>
  )
}
