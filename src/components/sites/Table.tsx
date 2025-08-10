"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { SiteLink } from "@/components/ui"
import { SiteAvatar } from "@/components/avatars"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface Site {
  id: number
  name: string
  created_at: string
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  sites: Site[]
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
    renderCell: params => <SiteAvatar site={params.row} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 350,
    editable: false,
    sortable: true,
    renderCell: params => <SiteLink site={params.row} />,
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
  const { meta, sort, order, sites } = formState.data

  const rows = sites.map(site => ({
    id: site.id,
    name: site.name,
    created_at: new Date(site.created_at),
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
