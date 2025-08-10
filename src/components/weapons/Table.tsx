"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { WeaponLink } from "@/components/ui"
import { WeaponAvatar } from "@/components/avatars"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface Weapon {
  id: number
  name: string
  created_at: string
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  weapons: Weapon[]
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
    renderCell: params => <WeaponAvatar weapon={params.row} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 200,
    editable: false,
    sortable: true,
    renderCell: params => <WeaponLink weapon={params.row} />,
  },
  {
    field: "juncture",
    headerName: "Juncture",
    width: 110,
    editable: false,
  },
  {
    field: "category",
    headerName: "Category",
    width: 110,
    editable: false,
  },
  {
    field: "damage",
    headerName: "Damage",
    width: 60,
    type: "number",
    editable: false,
    sortable: true,
  },
  {
    field: "concealment",
    headerName: "Conceal",
    width: 60,
    type: "number",
    editable: false,
    sortable: true,
  },
  {
    field: "reload_value",
    headerName: "Reload",
    width: 60,
    type: "number",
    editable: false,
    sortable: true,
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 100,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { meta, sort, order, weapons } = formState.data

  console.log("weapons", weapons)
  const rows = weapons.map(weapon => ({
    ...weapon,
    created_at: new Date(weapon.created_at),
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
