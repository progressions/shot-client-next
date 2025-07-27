"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pagination, Box, Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, useMediaQuery, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import Link from "next/link"
import type { Vehicle, PaginationMeta } from "@/types/types"
import { useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import type { SelectChangeEvent } from "@mui/material"
import { VehicleName } from "@/components/vehicles"
import { FormActions, useForm } from "@/reducers"
import { useCollection } from "@/hooks"

interface VehiclesProps {
  initialVehicles: Vehicle[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type ValidSort = "name" | "created_at" | "updated_at"
const validSorts: readonly ValidSort[] = ["name", "created_at", "updated_at"]
type ValidOrder = "asc" | "desc"
const validOrders: readonly ValidOrder[] = ["asc", "desc"]

// Mobile-specific component
function VehiclesMobile({
  vehicles,
  meta,
  sort,
  order,
  onPageChange,
  onSortChange,
  onOrderChange
}: {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
  onPageChange: (_event: React.ChangeEvent<unknown>, page: number) => void
  onSortChange: (event: SelectChangeEvent<string>) => void
  onOrderChange: () => void
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sort}
            label="Sort By"
            onChange={onSortChange}
            sx={{ color: "#ffffff", "& .MuiSvgIcon-root": { color: "#ffffff" } }}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="created_at">Created</MenuItem>
            <MenuItem value="updated_at">Updated</MenuItem>
          </Select>
        </FormControl>
        <Typography
          onClick={onOrderChange}
          sx={{
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "0.875rem",
            textDecoration: "underline"
          }}
        >
          {order === "asc" ? "↑ Asc" : "↓ Desc"}
        </Typography>
      </Box>
      {vehicles.length === 0 ? (
        <Typography sx={{ color: "#ffffff" }}>No vehicles available</Typography>
      ) : (
        vehicles.map((vehicle) => (
          <Card key={vehicle.id} sx={{ bgcolor: "#424242", color: "#ffffff" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body1">
                <Link href={`/vehicles/${vehicle.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                  <VehicleName vehicle={vehicle} />
                </Link>
              </Typography>
              <Typography variant="body2">Created: {formatDate(vehicle.created_at || "")}</Typography>
              <Typography variant="body2">Updated: {formatDate(vehicle.updated_at || "")}</Typography>
              <Typography variant="body2">Active: {vehicle.active ? "Yes" : "No"}</Typography>
            </CardContent>
          </Card>
        ))
      )}
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={onPageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size={isMobile ? "small" : "large"}
        sx={{ mt: 2 }}
      />
    </Stack>
  )
}

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
}

export default function Vehicles({ initialVehicles, initialMeta, initialSort, initialOrder }: VehiclesProps) {
  const { client } = useClient()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { formState, dispatchForm } = useForm<FormStateData>({
    vehicles: initialVehicles,
    meta: initialMeta,
    sort: initialSort,
    order: initialOrder
  })
  const { vehicles, meta, sort, order } = formState.data
  const fetchVehicles = useCallback(async (page: number = 1, sort: string = "name", order: string = "asc") => {
    try {
      const response = await client.getVehicles({ page, sort, order })
      dispatchForm({ type: FormActions.UPDATE, name: "vehicles", value: response.data.vehicles })
      dispatchForm({ type: FormActions.UPDATE, name: "meta", value: response.data.meta })
    } catch (err) {
      console.error("Fetch vehicles error:", err)
    }
  }, [client])
  const { handlePageChange, handleSortChange, handleSortChangeMobile, handleOrderChangeMobile } = useCollection({
    url: "vehicles",
    fetch: fetchVehicles,
    data: formState.data,
    dispatchForm,
    router
  })

  const formatDate = (date: string) => {
    if (isMobile) {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
    }
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isMobile) {
    return (
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 2 }}
        >
          Vehicles
        </Typography>
        <VehiclesMobile
          vehicles={vehicles}
          meta={meta}
          sort={sort}
          order={order}
          onPageChange={handlePageChange}
          onSortChange={handleSortChangeMobile}
          onOrderChange={handleOrderChangeMobile}
        />
      </Container>
    )
  }

  return (
    <>
      <Typography
        variant="h4"
        sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 2 }}
      >
        Vehicles
      </Typography>
      <Box sx={{ bgcolor: "#424242", borderRadius: 1, overflowX: "auto" }}>
        <Table
          sx={{
            maxWidth: { xs: "400px", sm: "100%" },
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#ffffff" }}>
                <TableSortLabel
                  active={sort === "name"}
                  direction={sort === "name" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("name")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                <TableSortLabel
                  active={sort === "created_at"}
                  direction={sort === "created_at" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("created_at")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                <TableSortLabel
                  active={sort === "updated_at"}
                  direction={sort === "updated_at" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("updated_at")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Updated
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  color: "#ffffff",
                  width: { xs: "60px", sm: "100px" },
                  textAlign: "center",
                  padding: { xs: "8px 4px", sm: "16px 8px" }
                }}
              >
                Active
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
                  No vehicles available
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Link href={`/vehicles/${vehicle.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                      {vehicle.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {formatDate(vehicle.created_at || "")}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {formatDate(vehicle.updated_at || "")}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      width: { xs: "60px", sm: "100px" },
                      textAlign: "center",
                      padding: { xs: "8px 4px", sm: "16px 8px" }
                    }}
                  >
                    {vehicle.active ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
        sx={{ mt: 2 }}
      />
  </>
  )
}

