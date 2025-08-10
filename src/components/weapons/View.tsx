"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, WeaponDetail, WeaponFilter } from "@/components/weapons"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

type FormStateData = {
  weapons: Weapon[]
  meta: PaginationMeta
  sort: string
  order: string
  weapon_type: string
  archetype: string
}

interface Weapon {
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
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={<WeaponFilter dispatch={dispatchForm} omit={["add"]} />}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="weapon"
            entities={formState.data.weapons}
            handleDelete={() => {}}
            DetailComponent={WeaponDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
