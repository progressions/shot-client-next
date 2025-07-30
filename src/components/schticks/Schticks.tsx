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
  SchtickDetail,
  CreateSchtickForm,
  EditSchtickForm,
} from "@/components/schticks"
import type { Schtick, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"

interface SchticksProperties {
  initialSchticks: Schtick[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  schticks: Schtick[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Schticks({
  initialSchticks,
  initialMeta,
  initialSort,
  initialOrder,
}: SchticksProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    schticks: initialSchticks,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, schticks, drawerOpen, error } = formState.data
  const [selectedSchtick, setSelectedSchtick] = useState<Schtick | null>(null)
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

  const fetchSchticks = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getSchticks({ page, sort, order })
        console.log("Fetched schticks:", response.data.schticks)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "schticks",
          value: response.data.schticks,
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
            error_ instanceof Error
              ? error_.message
              : "Failed to fetch schticks",
        })
        console.error("Fetch schticks error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.schticks === "reload") {
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
      fetchSchticks(page, currentSort, currentOrder)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchSchticks,
    validSorts,
    validOrders,
  ])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveSchtick = async (newSchtick: Schtick) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "schticks",
      value: [newSchtick, ...schticks],
    })
  }

  const handleDeleteSchtick = (schtickId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "schticks",
      value: schticks.filter(schtick => schtick.id !== schtickId),
    })
    if (selectedSchtick?.id === schtickId) setSelectedSchtick(null)
    router.refresh()
  }

  const handleEditSchtick = (schtick: Schtick) => {
    setSelectedSchtick(schtick)
  }

  const handleCloseEditSchtick = () => {
    setSelectedSchtick(null)
  }

  const handleSaveEditSchtick = (updatedSchtick: Schtick) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "schticks",
      value: schticks.map(f =>
        f.id === updatedSchtick.id ? updatedSchtick : f
      ),
    })
    setSelectedSchtick(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/schticks?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchSchticks(1, sort, order)
    } else {
      router.push(`/schticks?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchSchticks(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/schticks?page=1&sort=${newSort}&order=${order}`, {
        scroll: false,
      })
      fetchSchticks(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/schticks?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchSchticks(1, sort, newOrder)
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
          Schticks
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
            aria-label="create new schtick"
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
        {schticks.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No schticks available
          </Typography>
        ) : (
          schticks.map(schtick => (
            <SchtickDetail
              key={schtick.id}
              schtick={schtick}
              onDelete={handleDeleteSchtick}
              onEdit={handleEditSchtick}
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
      <CreateSchtickForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveSchtick}
      />
      {selectedSchtick && (
        <EditSchtickForm
          open={!!selectedSchtick}
          onClose={handleCloseEditSchtick}
          onSave={handleSaveEditSchtick}
          schtick={selectedSchtick}
        />
      )}
    </Box>
  )
}
