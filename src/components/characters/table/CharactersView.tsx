import { Box, Table } from "@mui/material"
import { CharactersMobile, CharacterFilter } from "@/components/characters"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  CharactersTableHeader,
  CharactersTableBody,
  CharactersPagination,
} from "@/components/characters"

interface CharactersViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
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

export default function CharactersView({
  viewMode,
  formState,
  dispatchForm,
  onPageChange,
  onSortChange,
  onOrderChange,
  initialIsMobile,
}: CharactersViewProps) {
  const { characters, meta, sort } = formState.data

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
          <CharacterFilter
            dispatch={dispatchForm}
            includeCharacters={false}
            omit={["add"]}
          />
          <Box sx={{ bgcolor: "#424242", borderRadius: 1 }}>
            <Table
              sx={{
                maxWidth: { xs: "400px", sm: "100%" },
                tableLayout: "fixed",
              }}
            >
              <CharactersTableHeader
                sort={sort}
                order={formState.data.order}
                onSortChange={onSortChange}
              />
              <CharactersTableBody
                characters={characters}
                formatDate={formatDate}
              />
            </Table>
          </Box>
          <CharactersPagination meta={meta} onPageChange={onPageChange} />
        </>
      )}
    </Box>
  )
}
