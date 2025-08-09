"use client"
import { Box, Table } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  CharactersMobile,
  TableHeader,
  TableBody,
  CharacterFilter,
} from "@/components/characters"
import { SortControls } from "@/components/ui"

interface ViewProps {
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
  characters: Character[]
  meta: PaginationMeta
  sort: string
  order: string
  character_type: string
  archetype: string
  faction_id: string
}

interface Character {
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

export default function View({
  viewMode,
  formState,
  dispatchForm,
  onPageChange,
  onSortChange,
  onOrderChange,
  initialIsMobile,
}: ViewProps) {
  const { characters, meta, sort, order } = formState.data

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
      <SortControls
        route="/characters"
        validSorts={["name", "type", "created_at", "updated_at"]}
        sort={sort}
        order={order}
        page={meta.current_page}
        totalPages={meta.total_pages}
        isMobile={viewMode === "mobile"}
        dispatchForm={dispatchForm}
        filter={<CharacterFilter dispatch={dispatchForm} omit={["add"]} />}
      >
        {viewMode === "mobile" ? (
          <CharactersMobile
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
                <TableBody characters={characters} formatDate={formatDate} />
              </Table>
            </Box>
          </>
        )}
      </SortControls>
    </Box>
  )
}
