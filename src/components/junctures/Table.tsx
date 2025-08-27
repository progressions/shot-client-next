"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, FactionLink, JunctureLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { JuncturesTableFormState } from "@/types/forms"

interface ViewProps {
  formState: FormStateType<JuncturesTableFormState>
  dispatchForm: (action: FormStateAction<JuncturesTableFormState>) => void
}

const columns: GridColDef<Juncture>[] = [
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
    width: 250,
    editable: false,
    sortable: true,
    renderCell: params => <JunctureLink juncture={params.row} />,
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 150,
    editable: false,
    sortable: false,
    renderCell: params => {
      if (params.row.faction?.id) {
        return <FactionLink faction={params.row.faction} />
      }
      return null
    },
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { junctures } = formState.data
  const rows = junctures.map(juncture => ({
    ...juncture,
    created_at: new Date(juncture.created_at),
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
