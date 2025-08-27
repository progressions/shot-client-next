"use client"
import { GridColDef } from "@mui/x-data-grid"
import {
  FormStateType,
  FormStateAction,
  WeaponsTableFormState,
  Weapon,
} from "@/types"
import { BaseDataGrid, WeaponLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"

interface ViewProps {
  formState: FormStateType<WeaponsTableFormState>
  dispatchForm: (action: FormStateAction<WeaponsTableFormState>) => void
}

const columns: GridColDef<Weapon>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <EntityAvatar entity={params.row} />,
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
  const { weapons } = formState.data
  const rows = weapons.map(weapon => ({
    ...weapon,
    created_at: new Date(weapon.created_at),
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
