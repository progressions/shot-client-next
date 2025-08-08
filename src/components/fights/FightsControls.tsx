"use client"
import { useRouter } from "next/navigation"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Box,
  Pagination,
} from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import type { SelectChangeEvent } from "@mui/material"

interface FightsControlsProps {
  sort: string
  order: string
  page: number
  totalPages: number
  onSortChange: (newSort: string) => void
  onOrderChange: () => void
  onPageChange: (page: number) => void
  children: React.ReactNode
}

export default function FightsControls({
  sort,
  order,
  page,
  totalPages,
  onSortChange,
  onOrderChange,
  onPageChange,
  children,
}: FightsControlsProps) {
  const router = useRouter()

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value
    onSortChange(newSort)
    router.push(`/fights?page=1&sort=${newSort}&order=${order}`, {
      scroll: false,
    })
  }

  const handleOrderChange = () => {
    onOrderChange()
    const newOrder = order === "asc" ? "desc" : "asc"
    router.push(`/fights?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    onPageChange(newPage)
    router.push(`/fights?page=${newPage}&sort=${sort}&order=${order}`, {
      scroll: false,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
        <Tooltip title={order === "asc" ? "Sort Ascending" : "Sort Descending"}>
          <IconButton
            onClick={handleOrderChange}
            sx={{ color: "#ffffff" }}
            aria-label={order === "asc" ? "sort ascending" : "sort descending"}
          >
            {order === "asc" ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </Tooltip>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          variant="outlined"
          color="primary"
          shape="rounded"
          size="large"
        />
      </Box>
      {children}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
      />
    </Box>
  )
}
