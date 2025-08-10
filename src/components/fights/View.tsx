"use client"
import { Box } from "@mui/material"
import { FormStateType } from "@/reducers"
import { FightDetail, Table } from "@/components/fights"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
}

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

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <SortControls
        isMobile={viewMode === "mobile"}
        validSorts={["name", "season", "session", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="fight"
            entities={formState.data.fights}
            handleDelete={() => {}}
            DetailComponent={FightDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
