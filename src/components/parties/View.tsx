"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, PartyDetail } from "@/components/parties"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

type FormStateData = {
  parties: Party[]
  meta: PaginationMeta
  sort: string
  order: string
  party_type: string
  archetype: string
}

interface Party {
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
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        isMobile={viewMode === "mobile"}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="party"
            entities={formState.data.parties}
            handleDelete={() => {}}
            DetailComponent={PartyDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
