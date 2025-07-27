"use client"

import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pagination, Box, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem, Stack, IconButton, Tooltip } from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { JunctureDetail, CreateJunctureForm, EditJunctureForm } from "@/components/junctures"
import type { Juncture, PaginationMeta } from "@/types/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"

interface JuncturesProps {
  initialJunctures: Juncture[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  junctures: Juncture[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Junctures({ initialJunctures, initialMeta, initialSort, initialOrder }: JuncturesProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    junctures: initialJunctures,
    meta: initialMeta,
    drawerOpen: false,
    error: null
  })
  const { meta, junctures, drawerOpen, error } = formState.data
  const [selectedJuncture, setSelectedJuncture] = useState<Juncture | null>(null)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)
  const router = useRouter()

  type ValidSort = "created_at" | "updated_at" | "name"
  const validSorts: readonly ValidSort[] = useMemo(() => ["created_at", "updated_at", "name"], [])
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchJunctures = useCallback(async (page: number = 1, sort: string = "created_at", order: string = "desc") => {
    try {
      const response = await client.getJunctures({ page, sort, order })
      console.log("Fetched junctures:", response.data.junctures)
      dispatchForm({ type: FormActions.UPDATE, name: "junctures", value: response.data.junctures })
      dispatchForm({ type: FormActions.UPDATE, name: "meta", value: response.data.meta })
      dispatchForm({ type: FormActions.ERROR, payload: null })
    } catch (err: unknown) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: err instanceof Error ? err.message : "Failed to fetch junctures"
      })
      console.error("Fetch junctures error:", err)
    }
  }, [client, dispatchForm])

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.junctures === "reload") {
      const params = new URLSearchParams(window.location.search)
      const page = params.get("page") ? parseInt(params.get("page")!, 10) : 1
      const sortParam = params.get("sort")
      const orderParam = params.get("order")
      const currentSort = sortParam && validSorts.includes(sortParam as ValidSort) ? sortParam : "created_at"
      const currentOrder = orderParam && validOrders.includes(orderParam as ValidOrder) ? orderParam : "desc"
      setSort(currentSort)
      setOrder(currentOrder)
      fetchJunctures(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchJunctures, validSorts, validOrders])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveJuncture = async (newJuncture: Juncture) => {
    dispatchForm({ type: FormActions.UPDATE, name: "junctures", value: [newJuncture, ...junctures] })
  }

  const handleDeleteJuncture = (junctureId: string) => {
    dispatchForm({ type: FormActions.UPDATE, name: "junctures", value: junctures.filter((juncture) => juncture.id !== junctureId) })
    if (selectedJuncture?.id === junctureId) setSelectedJuncture(null)
    router.refresh()
  }

  const handleEditJuncture = (juncture: Juncture) => {
    setSelectedJuncture(juncture)
  }

  const handleCloseEditJuncture = () => {
    setSelectedJuncture(null)
  }

  const handleSaveEditJuncture = (updatedJuncture: Juncture) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "junctures",
      value: junctures.map((f) => (f.id === updatedJuncture.id ? updatedJuncture : f))
    })
    setSelectedJuncture(null)
  }

  const handlePageChange = async (_event: React.ChangeEvent<unknown>, page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/junctures?page=1&sort=${sort}&order=${order}`, { scroll: false })
      await fetchJunctures(1, sort, order)
    } else {
      router.push(`/junctures?page=${page}&sort=${sort}&order=${order}`, { scroll: false })
      await fetchJunctures(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/junctures?page=1&sort=${newSort}&order=${order}`, { scroll: false })
      fetchJunctures(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/junctures?page=1&sort=${sort}&order=${newOrder}`, { scroll: false })
    await fetchJunctures(1, sort, newOrder)
  }

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontSize: { xs: "1.5rem", sm: "2.125rem" }
          }}
        >
          Junctures
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { xs: 1, sm: 1.5 },
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              alignItems: "center"
            }}
          >
            <FormControl sx={{ minWidth: { xs: 80, sm: 100 } }}>
              <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sort By"
                onChange={handleSortChange}
                sx={{ color: "#ffffff", "& .MuiSvgIcon-root": { color: "#ffffff" } }}
              >
                <MenuItem value="created_at">Created At</MenuItem>
                <MenuItem value="updated_at">Updated At</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={order === "asc" ? "Sort Ascending" : "Sort Descending"}>
              <IconButton
                onClick={handleOrderChange}
                sx={{ color: "#ffffff" }}
                aria-label={order === "asc" ? "sort ascending" : "sort descending"}
              >
                {order === "asc" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateDrawer}
            sx={{ px: 2 }}
            aria-label="create new juncture"
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
      <Pagination count={meta.total_pages} page={meta.current_page} onChange={handlePageChange} variant="outlined" color="primary" shape="rounded" size="large" />
      <Box my={2}>
        {junctures.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No junctures available
          </Typography>
        ) : (
          junctures.map((juncture) => (
            <JunctureDetail
              key={juncture.id}
              juncture={juncture}
              onDelete={handleDeleteJuncture}
              onEdit={handleEditJuncture}
            />
          ))
        )}
      </Box>
      <Pagination count={meta.total_pages} page={meta.current_page} onChange={handlePageChange} variant="outlined" color="primary" shape="rounded" size="large" />
      <CreateJunctureForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveJuncture}
      />
      {selectedJuncture && (
        <EditJunctureForm
          open={!!selectedJuncture}
          onClose={handleCloseEditJuncture}
          onSave={handleSaveEditJuncture}
          juncture={selectedJuncture}
        />
      )}
    </Box>
  )
}

