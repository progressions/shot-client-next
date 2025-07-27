"use client"

import Link from "next/link"
import { useMediaQuery, Stack, Box, Typography, Card, CardContent, Pagination, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { SelectChangeEvent } from "@mui/material"
import { VehicleName } from "@/components/vehicles"

export default function VehiclesMobile({
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
