"use client"

import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pagination, Box, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem, Stack, IconButton, Tooltip } from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { SiteDetail, CreateSiteForm, EditSiteForm } from "@/components/sites"
import type { Site, Faction, PaginationMeta } from "@/types/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"
import { InfoLink } from "@/components/links"
import { FactionsAutocomplete } from "@/components/autocomplete"

interface SitesProps {
  initialSites: Site[]
  initialFactions: Faction[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  sites: Site[]
  factions: Faction[]
  meta: PaginationMeta
  faction_id: string | null
  drawerOpen: boolean
  error: string | null
}

export default function Sites({ initialSites, initialFactions, initialMeta, initialSort, initialOrder }: SitesProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    sites: initialSites,
    factions: initialFactions,
    meta: initialMeta,
    drawerOpen: false,
    error: null
  })
  const { meta, sites, factions, faction_id, drawerOpen, error } = formState.data
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)
  const router = useRouter()

  type ValidSort = "created_at" | "updated_at" | "name"
  const validSorts: readonly ValidSort[] = useMemo(() => ["created_at", "updated_at", "name"], [])
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchSites = useCallback(async (page: number = 1, sort: string = "created_at", order: string = "desc", faction_id: string | null) => {
    try {
      const response = await client.getSites({ page, sort, order, faction_id })
      console.log("Fetched sites:", response.data.sites)
      dispatchForm({ type: FormActions.UPDATE, name: "sites", value: response.data.sites })
      dispatchForm({ type: FormActions.UPDATE, name: "meta", value: response.data.meta })
      dispatchForm({ type: FormActions.ERROR, payload: null })
    } catch (err: unknown) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: err instanceof Error ? err.message : "Failed to fetch sites"
      })
      console.error("Fetch sites error:", err)
    }
  }, [client, dispatchForm])

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.sites === "reload") {
      const params = new URLSearchParams(window.location.search)
      const page = params.get("page") ? parseInt(params.get("page")!, 10) : 1
      const sortParam = params.get("sort")
      const orderParam = params.get("order")
      const currentSort = sortParam && validSorts.includes(sortParam as ValidSort) ? sortParam : "created_at"
      const currentOrder = orderParam && validOrders.includes(orderParam as ValidOrder) ? orderParam : "desc"
      setSort(currentSort)
      setOrder(currentOrder)
      fetchSites(page, currentSort, currentOrder, faction_id)
    }
  }, [client, campaignData, dispatchForm, fetchSites, validSorts, validOrders, faction_id])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveSite = async (newSite: Site) => {
    dispatchForm({ type: FormActions.UPDATE, name: "sites", value: [newSite, ...sites] })
  }

  const handleDeleteSite = (siteId: string) => {
    dispatchForm({ type: FormActions.UPDATE, name: "sites", value: sites.filter((site) => site.id !== siteId) })
    if (selectedSite?.id === siteId) setSelectedSite(null)
    router.refresh()
  }

  const handleEditSite = (site: Site) => {
    setSelectedSite(site)
  }

  const handleCloseEditSite = () => {
    setSelectedSite(null)
  }

  const handleSaveEditSite = (updatedSite: Site) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "sites",
      value: sites.map((f) => (f.id === updatedSite.id ? updatedSite : f))
    })
    setSelectedSite(null)
  }

  const handlePageChange = async (_event: React.ChangeEvent<unknown>, page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/sites?page=1&sort=${sort}&order=${order}`, { scroll: false })
      await fetchSites(1, sort, order, faction_id)
    } else {
      router.push(`/sites?page=${page}&sort=${sort}&order=${order}`, { scroll: false })
      await fetchSites(page, sort, order, faction_id)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/sites?page=1&sort=${newSort}&order=${order}`, { scroll: false })
      fetchSites(1, newSort, order, faction_id)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/sites?page=1&sort=${sort}&order=${newOrder}`, { scroll: false })
    await fetchSites(1, sort, newOrder, faction_id)
  }

  const handleFactionChange = async (value: string | null) => {
    const newFactionId = value
    dispatchForm({ type: FormActions.UPDATE, name: "faction_id", value: newFactionId })
    router.push(`/sites?page=1&sort=${sort}&order=${order}&faction_id=${newFactionId}`, { scroll: false })
    await fetchSites(1, sort, order, newFactionId)
  }

  const factionOptions = useMemo(() => {
    return factions.map((faction) => ({
      label: faction.name || "",
      value: faction.id || ""
    }))
  }, [factions])

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
          Feng Shui Sites
        </Typography>
        <Box sx={{ pb: 2 }}>
          <Typography>A <InfoLink href="/sites" info="Feng Shui Site" /> is a location whose flow of energy produces powerful <InfoLink info="Chi" /> for those who are attuned to it. A Feng Shui Site belongs to a <InfoLink href="/factions" info="Faction" />.</Typography>
        </Box>
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
            <FormControl sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <FactionsAutocomplete
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
            aria-label="create new site"
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
        {sites.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No sites available
          </Typography>
        ) : (
          sites.map((site) => (
            <SiteDetail
              key={site.id}
              site={site}
              onDelete={handleDeleteSite}
              onEdit={handleEditSite}
            />
          ))
        )}
      </Box>
      <Pagination count={meta.total_pages} page={meta.current_page} onChange={handlePageChange} variant="outlined" color="primary" shape="rounded" size="large" />
      <CreateSiteForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveSite}
      />
      {selectedSite && (
        <EditSiteForm
          open={!!selectedSite}
          onClose={handleCloseEditSite}
          onSave={handleSaveEditSite}
          site={selectedSite}
        />
      )}
    </Box>
  )
}

