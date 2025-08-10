"use client"

import { queryParams } from "@/lib"
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
  CampaignDetail,
  CreateCampaignForm,
  EditCampaignForm,
} from "@/components/campaigns"
import type { Campaign, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"
import { InfoLink } from "@/components/ui"

interface ListProps {
  initialCampaigns: Campaign[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  campaigns: Campaign[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function List({
  initialCampaigns,
  initialMeta,
  initialSort,
  initialOrder,
}: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    campaigns: initialCampaigns,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, campaigns, drawerOpen, error } = formState.data
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
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

  const fetchCampaigns = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getCampaigns({ page, sort, order })
        console.log("Fetched campaigns:", response.data.campaigns)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "campaigns",
          value: response.data.campaigns,
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
              : "Failed to fetch campaigns",
        })
        console.error("Fetch campaigns error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.campaigns === "reload") {
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
      fetchCampaigns(page, currentSort, currentOrder)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchCampaigns,
    validSorts,
    validOrders,
  ])

  useEffect(() => {
    const url = `/campaigns?${queryParams({
      page: 1,
      sort,
      order,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchCampaigns(1, sort, order)
  }, [fetchCampaigns, order, router, sort])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveCampaign = async (newCampaign: Campaign) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "campaigns",
      value: [newCampaign, ...campaigns],
    })
  }

  const handleDeleteCampaign = (campaignId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "campaigns",
      value: campaigns.filter(campaign => campaign.id !== campaignId),
    })
    if (selectedCampaign?.id === campaignId) setSelectedCampaign(null)
    router.refresh()
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
  }

  const handleCloseEditCampaign = () => {
    setSelectedCampaign(null)
  }

  const handleSaveEditCampaign = (updatedCampaign: Campaign) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "campaigns",
      value: campaigns.map(f =>
        f.id === updatedCampaign.id ? updatedCampaign : f
      ),
    })
    setSelectedCampaign(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/campaigns?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchCampaigns(1, sort, order)
    } else {
      router.push(`/campaigns?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchCampaigns(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/campaigns?page=1&sort=${newSort}&order=${order}`, {
        scroll: false,
      })
      fetchCampaigns(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/campaigns?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchCampaigns(1, sort, newOrder)
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
          Feng Shui Campaigns
        </Typography>
        <Box sx={{ pb: 2 }}>
          <Typography>
            A <InfoLink href="/campaigns" info="Campaign" /> is a collection of{" "}
            <InfoLink href="/characters" info="Characters" /> battling against
            various evil <InfoLink href="/factions" info="Factions" /> for
            control of the <InfoLink info="Chi War" />. You can create, edit,
            and delete campaigns.
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
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateDrawer}
            sx={{ px: 2 }}
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
        {campaigns.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No campaigns available
          </Typography>
        ) : (
          campaigns.map(campaign => (
            <CampaignDetail
              key={JSON.stringify(campaign)}
              campaign={campaign}
              onDelete={handleDeleteCampaign}
              onEdit={handleEditCampaign}
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
      <CreateCampaignForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveCampaign}
      />
      {selectedCampaign && (
        <EditCampaignForm
          open={!!selectedCampaign}
          onClose={handleCloseEditCampaign}
          onSave={handleSaveEditCampaign}
          campaign={selectedCampaign}
        />
      )}
    </Box>
  )
}
