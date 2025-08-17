"use client"
import { useEffect, useRef } from "react"
import { Box, Skeleton, Stack, SxProps, Theme } from "@mui/material"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { PaginationMeta } from "@/types"

interface FormStateData<T> {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  data: T[]
  drawerOpen: boolean
}

interface BaseDataGridProps<T> {
  formState: FormStateType<FormStateData<T>>
  dispatchForm: (action: FormStateAction<FormStateData<T>>) => void
  columns: GridColDef<T>[]
  rows: T[]
  sx?: SxProps<Theme>
}

export function BaseDataGrid<T>({
  formState,
  dispatchForm,
  columns,
  rows,
  sx = {},
}: BaseDataGridProps<T>) {
  const { meta, sort, order } = formState.data
  const ready = useRef(false)

  useEffect(() => {
    if (!ready.current) {
      ready.current = true
    }
  }, [ready])

  const onSortChange = (model: GridSortModel) => {
    const sortField = model[0]?.field || ""
    const sortOrder = model[0]?.sort || ""
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: {
        ...formState.data.filters,
        sort: sortField,
        order: sortOrder,
      },
    })
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        ...sx,
      }}
    >
      {ready.current ? (
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={meta.total_count}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: meta.current_page - 1,
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
          onSortModelChange={onSortChange}
          sortingMode="server"
          hideFooterPagination
        />
      ) : (
        <Stack spacing={1}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={200} height={24} />
              <Skeleton variant="text" width={100} height={24} />
              <Skeleton variant="text" width={100} height={24} />
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}
