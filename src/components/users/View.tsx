"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, UserDetail } from "@/components/users"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

type FormStateData = {
  users: User[]
  meta: PaginationMeta
  sort: string
  order: string
  user_type: string
  archetype: string
}

interface User {
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
        validSorts={["name", "type", "created_at", "updated_at"]}
        isMobile={viewMode === "mobile"}
        formState={formState}
        dispatchForm={dispatchForm}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="user"
            entities={formState.data.users}
            handleDelete={() => {}}
            DetailComponent={UserDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
