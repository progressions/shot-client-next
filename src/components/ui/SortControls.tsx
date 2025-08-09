"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Pagination,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

type SortControlsProps = {
  isMobile: boolean
  validSorts: string[]
  sort: string
  order: "asc" | "desc"
  children?: React.ReactNode
  filter?: React.ReactNode
}

export function SortControls({
  route,
  isMobile,
  validSorts,
  page,
  totalPages,
  sort,
  order,
  children,
  filter,
  onPageChange,
}: SortControlsProps) {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)

  const handleToggleFilter = () => {
    setShowFilter(!showFilter)
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value
    onSortChange(newSort)
    router.push(`${route}?page=1&sort=${newSort}&order=${order}`, {
      scroll: false,
    })
  }

  const handleOrderChange = () => {
    onOrderChange()
    const newOrder = order === "asc" ? "desc" : "asc"
    router.push(`${route}?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    onPageChange(newPage)
    router.push(`${route}?page=${newPage}&sort=${sort}&order=${order}`, {
      scroll: false,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {isMobile && (
        <Box sx={{ display: "flex", mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <FormControl sx={{ minWidth: { xs: 80, sm: 100 }, mb: 1 }}>
              <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>
                Sort By
              </InputLabel>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sort By"
                onChange={handleSortChange}
                sx={{
                  width: 120,
                  color: "#ffffff",
                  "& .MuiSvgIcon-root": { color: "#ffffff" },
                }}
              >
                {validSorts.map(sortOption => (
                  <MenuItem key={sortOption} value={sortOption}>
                    {sortOption.replace("_", " ").charAt(0).toUpperCase() +
                      sortOption.replace("_", " ").slice(1)}
                  </MenuItem>
                ))}
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
          {!!filter && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleToggleFilter}
                sx={{ height: "fit-content" }}
                endIcon={showFilter ? <ArrowDropUp /> : <ArrowDropDown />}
              >
                Filter
              </Button>
            </Box>
          )}
        </Box>
      )}
      {(!isMobile || showFilter) && filter}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
      />
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
