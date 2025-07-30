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
import { UserDetail, CreateUserForm, EditUserForm } from "@/components/users"
import type { User, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import type { SelectChangeEvent } from "@mui/material"
import { InfoLink } from "@/components/links"

interface UsersProperties {
  initialUsers: User[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type FormStateData = {
  users: User[]
  meta: PaginationMeta
  drawerOpen: boolean
  error: string | null
}

export default function Users({
  initialUsers,
  initialMeta,
  initialSort,
  initialOrder,
}: UsersProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    users: initialUsers,
    meta: initialMeta,
    drawerOpen: false,
    error: null,
  })
  const { meta, users, drawerOpen, error } = formState.data
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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

  const fetchUsers = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getUsers({ page, sort, order })
        console.log("Fetched users:", response.data.users)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "users",
          value: response.data.users,
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
            error_ instanceof Error ? error_.message : "Failed to fetch users",
        })
        console.error("Fetch users error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("User data:", campaignData)
    if (campaignData.users === "reload") {
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
      fetchUsers(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchUsers, validSorts, validOrders])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveUser = async (newUser: User) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "users",
      value: [newUser, ...users],
    })
  }

  const handleDeleteUser = (userId: string) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "users",
      value: users.filter(user => user.id !== userId),
    })
    if (selectedUser?.id === userId) setSelectedUser(null)
    router.refresh()
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
  }

  const handleCloseEditUser = () => {
    setSelectedUser(null)
  }

  const handleSaveEditUser = (updatedUser: User) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "users",
      value: users.map(f => (f.id === updatedUser.id ? updatedUser : f)),
    })
    setSelectedUser(null)
  }

  const handlePageChange = async (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/users?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchUsers(1, sort, order)
    } else {
      router.push(`/users?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchUsers(page, sort, order)
    }
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      // Perform async operations
      router.push(`/users?page=1&sort=${newSort}&order=${order}`, {
        scroll: false,
      })
      fetchUsers(1, newSort, order)
    }
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/users?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchUsers(1, sort, newOrder)
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
          Users
        </Typography>
        <Box sx={{ pb: 2 }}>
          <Typography>
            A <InfoLink href="/users" info="User" /> is a player of the game.{" "}
            They could have multiple{" "}
            <InfoLink href="/characters" info="Characters" /> and belong to
            multiple <InfoLink href="/campaigns" info="Campaigns" />.
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
        {users.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No users available
          </Typography>
        ) : (
          users.map(user => (
            <UserDetail
              key={JSON.stringify(user)}
              user={user}
              onDelete={handleDeleteUser}
              onEdit={handleEditUser}
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
      <CreateUserForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveUser}
      />
      {selectedUser && (
        <EditUserForm
          open={!!selectedUser}
          onClose={handleCloseEditUser}
          onSave={handleSaveEditUser}
          user={selectedUser}
        />
      )}
    </Box>
  )
}
