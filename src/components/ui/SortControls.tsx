"use client"

import { useState } from "react"
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
import { FormStateType, FormActions } from "@/reducers"

type SortControlsProps = {
  isMobile: boolean
  validSorts: string[]
  children?: React.ReactNode
  filter?: React.ReactNode
  formState: FormStateType
  dispatchForm: React.Dispatch<FormStateType>
}

export function SortControls({
  isMobile,
  validSorts,
  children,
  filter,
  formState,
  dispatchForm,
}: SortControlsProps) {
  const [showFilter, setShowFilter] = useState(false)

  const { meta, sort, order } = formState.data
  const page = meta?.current_page || 1
  const totalPages = meta?.total_pages || 1

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as string
    if (sort === newSort) {
      // If the sort is already the same, toggle the order
      const newOrder = order === "asc" ? "desc" : "asc"
      dispatchForm({
        type: FormActions.UPDATE,
        name: "order",
        value: newOrder,
      })
      return
    }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "sort",
      value: newSort,
    })
  }

  const handleToggleFilter = () => {
    setShowFilter(!showFilter)
  }

  const handleOrderChange = () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    dispatchForm({ type: FormActions.UPDATE, name: "page", value: newPage })
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
