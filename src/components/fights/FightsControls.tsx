"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Box,
  Pagination,
} from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { FightFilter } from "@/components/fights"
import { SortControls } from "@/components/ui"

interface FightsControlsProps {
  sort: string
  order: string
  page: number
  totalPages: number
  onSortChange: (newSort: string) => void
  onOrderChange: () => void
  onPageChange: (page: number) => void
  children: React.ReactNode
  isMobile?: boolean
}

export default function FightsControls({
  sort,
  order,
  page,
  totalPages,
  onSortChange,
  onOrderChange,
  onPageChange,
  dispatchForm,
  children,
  isMobile = false,
}: FightsControlsProps) {
  const router = useRouter()
  const validSorts = ["name", "type", "created_at", "updated_at"] as const
  const [showFilter, setShowFilter] = useState(false)

  const handleToggleFilter = () => {
    setShowFilter(!showFilter)
  }

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
      <Box>
        <SortControls
          isMobile={isMobile}
          handleSortChange={handleSortChange}
          handleOrderChange={handleOrderChange}
          validSorts={validSorts}
          handleToggleFilter={handleToggleFilter}
          sort={sort}
          order={order}
          showFilter={showFilter}
        >
          <FightFilter
            dispatch={dispatchForm}
            includeFights={false}
            omit={["add"]}
          />
        </SortControls>
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
