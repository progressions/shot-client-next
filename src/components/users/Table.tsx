"use client"
import { GridColDef } from "@mui/x-data-grid"
import { UserTableProps } from "@/types"
import { BaseDataGrid, UserLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"

const columns: GridColDef<User>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <Avatar entity={params.row} />,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
    editable: false,
    sortable: true,
    renderCell: params => <UserLink user={params.row} />,
  },
  {
    field: "first_name",
    headerName: "First Name",
    width: 150,
    editable: false,
    sortable: true,
  },
  {
    field: "last_name",
    headerName: "Last Name",
    width: 150,
    editable: false,
    sortable: true,
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: UserTableProps) {
  const { users } = formState.data
  const rows = users.map(user => ({
    ...user,
    created_at: new Date(user.created_at),
  }))

  return (
    <BaseDataGrid
      formState={formState}
      dispatchForm={dispatchForm}
      columns={columns}
      rows={rows}
    />
  )
}
