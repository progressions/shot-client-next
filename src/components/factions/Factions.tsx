"use client"

import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Pagination,
  Box,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import {
  FactionDetail,
  CreateFactionForm,
  EditFactionForm,
} from "@/components/factions"
import type { Faction, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"

interface FactionsProps {
  initialFactions: Faction[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  factions: Faction[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Factions({
  initialFactions,
  initialMeta,
  initialSort,
  initialOrder,
}: FactionsProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    factions: initialFactions,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, factions, drawerOpen, error } = formState.data
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)
  const router = useRouter()

  type ValidSort = "created_at" | "updated_at" | "name"
  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchFactions = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getFactions({ page, sort, order })
        console.log("Fetched factions:", response.data.factions)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "factions",
          value: response.data.factions,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
        dispatchForm({ type: FormActions.ERROR, payload: null })
      } catch (error_: unknown) {
        dispatchForm({
          type: FormActions.ERROR,
          payload:
            error_ instanceof Error ? error_.message : "Failed to fetch factions",
        })
        console.error("Fetch factions error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.factions === "reload") {
      const params = new URLSearchParams(globalThis.location.search)
      const page = params.get("page") ? Number.parseInt(params.get("page")!, 10) : 1
      const sortParam = params.get("sort")
      const orderParam = params.get("order")
      const currentSort =
        sortParam && validSorts.includes(sortParam as ValidSort)
          ? sortParam
          : "created_at"
      const currentOrder =
        orderParam && validOrders.includes(orderParam as ValidOrder)
          ? orderParam
          : "desc"
      setSort(currentSort)
      setOrder(currentOrder)
      fetchFactions(page, currentSort, currentOrder)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchFactions,
    validSorts,
    validOrders,
  ])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveFaction = async (newFaction: Faction) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "factions",
      value: [newFaction, ...factions],
    })
  }

  const handleDeleteFaction = (factionId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "factions",
      value: factions.filter(faction => faction.id !== factionId),
    })
    if (selectedFaction?.id === factionId) setSelectedFaction(null)
    router.refresh()
  }

  const handleEditFaction = (faction: Faction) => {
    setSelectedFaction(faction)
  }

  const handleCloseEditFaction = () => {
    setSelectedFaction(null)
  }

  const handleSaveEditFaction = (updatedFaction: Faction) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "factions",
      value: factions.map(f =>
        f.id === updatedFaction.id ? updatedFaction : f
      ),
    })
    setSelectedFaction(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/factions?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFactions(1, sort, order)
    } else {
      router.push(`/factions?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFactions(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/factions?page=1&sort=${newSort}&order=${order}`, {
        scroll: false,
      })
      fetchFactions(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/factions?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchFactions(1, sort, newOrder)
  }

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
          }}
        >
          Factions
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { xs: 1, sm: 1.5 },
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              alignItems: "center",
            }}
          >
            <FormControl sx={{ minWidth: { xs: 80, sm: 100 } }}>
              <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>
                Sort By
              </InputLabel>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sort By"
                onChange={handleSortChange}
                sx={{
                  color: "#ffffff",
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }}
              >
                <MenuItem value="created_at">Created At</MenuItem>
                <MenuItem value="updated_at">Updated At</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
            <Tooltip
              title={order === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              <IconButton
                onClick={handleOrderChange}
                sx={{ color: "#ffffff" }}
                aria-label={
                  order === "asc" ? "sort ascending" : "sort descending"
                }
              >
                {order === "asc" ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateDrawer}
            sx={{ px: 2 }}
            aria-label="create new faction"
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
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
      />
      <Box my={2}>
        {factions.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No factions available
          </Typography>
        ) : (
          factions.map(faction => (
            <FactionDetail
              key={faction.id}
              faction={faction}
              onDelete={handleDeleteFaction}
              onEdit={handleEditFaction}
            />
          ))
        )}
      </Box>
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
      />
      <CreateFactionForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveFaction}
      />
      {selectedFaction && (
        <EditFactionForm
          open={!!selectedFaction}
          onClose={handleCloseEditFaction}
          onSave={handleSaveEditFaction}
          faction={selectedFaction}
        />
      )}
    </Box>
  )
}
