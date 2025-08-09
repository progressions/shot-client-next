"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Box } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { FightFilter } from "@/components/fights"
import { SortControls } from "@/components/ui"

interface FightsControlsProps {
  sort: string
  order: string
  onSortChange: (newSort: string) => void
  onOrderChange: () => void
  children: React.ReactNode
  isMobile?: boolean
}

export default function FightsControls({
  sort,
  order,
  onSortChange,
  onOrderChange,
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
          filter={
            <FightFilter
              dispatch={dispatchForm}
              includeFights={false}
              omit={["add"]}
            />
          }
        >
          {children}
        </SortControls>
      </Box>
    </Box>
  )
}
