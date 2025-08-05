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
  JunctureDetail,
  CreateJunctureForm,
  EditJunctureForm,
} from "@/components/junctures"
import type { Juncture, Faction, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"
import { InfoLink } from "@/components/ui"
import { FactionAutocomplete } from "@/components/autocomplete"

interface JuncturesProperties {
  initialJunctures: Juncture[]
  initialFactions: Faction[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  junctures: Juncture[]
  factions: Faction[]
  meta: PaginationMeta
  faction_id: string | null
  drawerOpen: boolean
  error: string | null
}

export default function Junctures({
  initialJunctures,
  initialFactions,
  initialMeta,
  initialSort,
  initialOrder,
}: JuncturesProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    junctures: initialJunctures,
    factions: initialFactions,
    meta: initialMeta,
    faction_id: null,
    drawerOpen: false,
    error: null,
  })
  const { meta, junctures, factions, faction_id, drawerOpen, error } =
    formState.data
  const [selectedJuncture, setSelectedJuncture] = useState<Juncture | null>(
    null
  )
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

  const fetchJunctures = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc",
      faction_id: string | null
    ) => {
      try {
        const response = await client.getJunctures({
          page,
          sort,
          order,
          faction_id,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "junctures",
          value: response.data.junctures,
        })
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
            error_ instanceof Error
              ? error_.message
              : "Failed to fetch junctures",
        })
        console.error("Fetch junctures error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    if (campaignData.junctures === "reload") {
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
      fetchJunctures(page, currentSort, currentOrder, faction_id)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchJunctures,
    validSorts,
    validOrders,
    faction_id,
  ])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveJuncture = async (newJuncture: Juncture) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "junctures",
      value: [newJuncture, ...junctures],
    })
  }

  const handleDeleteJuncture = (junctureId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "junctures",
      value: junctures.filter(juncture => juncture.id !== junctureId),
    })
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
      value: junctures.map(f =>
        f.id === updatedJuncture.id ? updatedJuncture : f
      ),
    })
    setSelectedJuncture(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/junctures?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchJunctures(1, sort, order, faction_id)
    } else {
      router.push(
        `/junctures?page=${page}&sort=${sort}&order=${order}&faction_id=${faction_id}`,
        { scroll: false }
      )
      await fetchJunctures(page, sort, order, faction_id)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(
        `/junctures?page=1&sort=${newSort}&order=${order}&faction_id=${faction_id}`,
        { scroll: false }
      )
      fetchJunctures(1, newSort, order, faction_id)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(
      `/junctures?page=1&sort=${sort}&order=${newOrder}&faction_id=${faction_id}`,
      { scroll: false }
    )
    await fetchJunctures(1, sort, newOrder, faction_id)
  }

  const handleFactionChange = async (value: string | null) => {
    const newFactionId = value
    dispatchForm({
      type: FormActions.UPDATE,
      name: "faction_id",
      value: newFactionId,
    })
    router.push(
      `/junctures?page=1&sort=${sort}&order=${order}&faction_id=${newFactionId}`,
      { scroll: false }
    )
    await fetchJunctures(1, sort, order, newFactionId)
  }

  const factionOptions = useMemo(() => {
    return factions.map(faction => ({
      label: faction.name || "",
      value: faction.id || "",
    }))
  }, [factions])

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
          Junctures
        </Typography>
        <Box sx={{ pb: 2 }}>
          <Typography>
            A <InfoLink href="/junctures" info="Juncture" /> is a period in time
            which has <InfoLink info="Portals" /> opening to the{" "}
            <InfoLink info="Netherworld" />. A Juncture is controlled by the{" "}
            <InfoLink href="/factions" info="Faction" /> which controlls the
            most powerful <InfoLink href="/sites" info="Feng Shui Sites" />.
          </Typography>
        </Box>
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
            <FormControl sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <FactionAutocomplete
                options={factionOptions}
                value={faction_id || ""}
                onChange={handleFactionChange}
              />
            </FormControl>
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
        {junctures.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No junctures available
          </Typography>
        ) : (
          junctures.map(juncture => (
            <JunctureDetail
              key={juncture.id}
              juncture={juncture}
              onDelete={handleDeleteJuncture}
              onEdit={handleEditJuncture}
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
