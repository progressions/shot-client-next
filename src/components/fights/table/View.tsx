"use client"
import { Box, Table } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  FightsMobile,
  FightsControls,
  TableHeader,
  TableBody,
} from "@/components/fights"

interface FightsViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
  onPageChange: (page: number) => void
  onSortChange: (newSort: ValidSort) => void
  onOrderChange: () => void
  initialIsMobile: boolean
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
type FormStateData = {
  fights: Fight[]
  meta: PaginationMeta
  sort: string
  order: string
  fight_type: string
  archetype: string
  faction_id: string
}

interface Fight {
  id: string
  name: string
  type: string
  created_at: string
  active: boolean
}

interface PaginationMeta {
  current_page: number
  total_pages: number
}

export default function FightsView({
  viewMode,
  formState,
  dispatchForm,
  onPageChange,
  onSortChange,
  onOrderChange,
  initialIsMobile,
}: FightsViewProps) {
  const { fights, meta, sort, order } = formState.data

  const formatDate = (date: string) => {
    if (viewMode === "mobile") {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
    }
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <FightsControls
        sort={sort}
        order={order}
        page={meta.current_page}
        totalPages={meta.total_pages}
        onSortChange={onSortChange}
        onOrderChange={onOrderChange}
        onPageChange={onPageChange}
        isMobile={viewMode === "mobile"}
        dispatchForm={dispatchForm}
      >
        {viewMode === "mobile" ? (
          <FightsMobile
            formState={formState}
            dispatchForm={dispatchForm}
            onPageChange={onPageChange}
            onSortChange={onSortChange}
            onOrderChange={onOrderChange}
            initialIsMobile={initialIsMobile}
          />
        ) : (
          <>
            <Box sx={{ bgcolor: "#424242", borderRadius: 1 }}>
              <Table
                sx={{
                  maxWidth: { xs: "400px", sm: "100%" },
                  tableLayout: "fixed",
                }}
              >
                <TableHeader
                  sort={sort}
                  order={order}
                  onSortChange={onSortChange}
                />
                <TableBody fights={fights} formatDate={formatDate} />
              </Table>
            </Box>
          </>
        )}
      </FightsControls>
    </Box>
  )
}
