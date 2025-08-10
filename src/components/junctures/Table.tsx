"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { JunctureLink } from "@/components/ui"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface Juncture {
  id: number
  name: string
  created_at: string
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  junctures: Juncture[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: { data: FormStateData }
  dispatchForm: (action: {
    type: FormActions
    name: string
    value: unknown
  }) => void
}

const columns: GridColDef<(typeof rows)[number]>[] = [
  {
    field: "name",
    headerName: "Name",
    width: 350,
    editable: false,
    sortable: true,
    renderCell: params => <JunctureLink juncture={params.row} />,
  },
  {
    field: "created_at",
    headerName: "Created At",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { meta, sort, order, junctures } = formState.data

  const rows = junctures.map(juncture => ({
    id: juncture.id,
    name: juncture.name,
    created_at: new Date(juncture.created_at),
  }))

  const onPageChange = (newPage: number) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "page",
      value: newPage, // Already 1-based from Pagination
    })
  }

  const onSortChange = (model: GridSortModel) => {
    const sortField = model[0]?.field || ""
    const sortOrder = model[0]?.sort || ""
    dispatchForm({
      type: FormActions.UPDATE,
      name: "sort",
      value: sortField,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "order",
      value: sortOrder,
    })
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={meta.total_count}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: meta.current_page - 1, // Convert to 0-based for DataGrid
            },
          },
          sortModel: [
            {
              field: sort,
              sort: order as "asc" | "desc" | undefined,
            },
          ],
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
        onPaginationModelChange={model => onPageChange(model.page + 1)}
        onSortModelChange={onSortChange}
        sortingMode="server"
        hideFooterPagination
      />
    </Box>
  )
}
