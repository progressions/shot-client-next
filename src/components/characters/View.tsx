"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, CharacterDetail } from "@/components/characters"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

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

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <SortControls
        route="/characters"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="character"
            entities={formState.data.characters}
            handleDelete={() => {}}
            DetailComponent={CharacterDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
