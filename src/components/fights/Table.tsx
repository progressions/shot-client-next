"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { FightLink } from "@/components/ui"
import type { Fight } from "@/types"
import { FightAvatar } from "@/components/avatars"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  fights: Fight[]
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
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <FightAvatar fight={params.row} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 280,
    editable: false,
    sortable: true,
    renderCell: params => <FightLink fight={params.row} />,
  },
  {
    field: "season",
    headerName: "Season",
    type: "number",
    width: 80,
    editable: false,
  },
  {
    field: "session",
    headerName: "Session",
    type: "number",
    width: 80,
    editable: false,
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
  {
    field: "started_at",
    headerName: "Started",
    type: "date",
    width: 100,
    editable: false,
  },
  {
    field: "ended_at",
    headerName: "Ended",
    type: "ended",
    width: 100,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { meta, sort, order, fights } = formState.data

  const rows = fights.map(fight => ({
    ...fight,
    started_at: fight.started_at ? new Date(fight.started_at) : null,
    ended_at: fight.ended_at ? new Date(fight.ended_at) : null,
    updated_at: new Date(fight.updated_at),
    created_at: new Date(fight.created_at),
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
