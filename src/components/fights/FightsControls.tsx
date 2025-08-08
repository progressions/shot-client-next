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
} from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import type { SelectChangeEvent } from "@mui/material"

interface FightsControlsProps {
  sort: string
  order: string
  onSortChange: (newSort: string) => void
  onOrderChange: () => void
}

export default function FightsControls({
  sort,
  order,
  onSortChange,
  onOrderChange,
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

  return (
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
          {order === "asc" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
