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
  WeaponDetail,
  CreateWeaponForm,
  EditWeaponForm,
} from "@/components/weapons"
import type { Weapon, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"

interface WeaponsProps {
  initialWeapons: Weapon[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  weapons: Weapon[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Weapons({
  initialWeapons,
  initialMeta,
  initialSort,
  initialOrder,
}: WeaponsProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    weapons: initialWeapons,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, weapons, drawerOpen, error } = formState.data
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)
  const router = useRouter()

  type ValidSort =
    | "created_at"
    | "updated_at"
    | "name"
    | "juncture"
    | "category"
  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name", "juncture", "category"],
    []
  )
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchWeapons = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getWeapons({ page, sort, order })
        console.log("Fetched weapons:", response.data.weapons)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "weapons",
          value: response.data.weapons,
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
            error_ instanceof Error ? error_.message : "Failed to fetch weapons",
        })
        console.error("Fetch weapons error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.weapons === "reload") {
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
      fetchWeapons(page, currentSort, currentOrder)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchWeapons,
    validSorts,
    validOrders,
  ])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveWeapon = async (newWeapon: Weapon) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapons",
      value: [newWeapon, ...weapons],
    })
  }

  const handleDeleteWeapon = (weaponId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapons",
      value: weapons.filter(weapon => weapon.id !== weaponId),
    })
    if (selectedWeapon?.id === weaponId) setSelectedWeapon(null)
    router.refresh()
  }

  const handleEditWeapon = (weapon: Weapon) => {
    setSelectedWeapon(weapon)
  }

  const handleCloseEditWeapon = () => {
    setSelectedWeapon(null)
  }

  const handleSaveEditWeapon = (updatedWeapon: Weapon) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapons",
      value: weapons.map(f => (f.id === updatedWeapon.id ? updatedWeapon : f)),
    })
    setSelectedWeapon(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/weapons?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchWeapons(1, sort, order)
    } else {
      router.push(`/weapons?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchWeapons(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/weapons?page=1&sort=${newSort}&order=${order}`, {
        scroll: false,
      })
      fetchWeapons(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/weapons?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchWeapons(1, sort, newOrder)
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
          Weapons
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
                <MenuItem value="juncture">Juncture</MenuItem>
                <MenuItem value="category">Category</MenuItem>
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
            aria-label="create new weapon"
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
        {weapons.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No weapons available
          </Typography>
        ) : (
          weapons.map(weapon => (
            <WeaponDetail
              key={weapon.id}
              weapon={weapon}
              onDelete={handleDeleteWeapon}
              onEdit={handleEditWeapon}
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
      <CreateWeaponForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveWeapon}
      />
      {selectedWeapon && (
        <EditWeaponForm
          open={!!selectedWeapon}
          onClose={handleCloseEditWeapon}
          onSave={handleSaveEditWeapon}
          weapon={selectedWeapon}
        />
      )}
    </Box>
  )
}
