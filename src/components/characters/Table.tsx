"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, FactionLink, CharacterLink } from "@/components/ui"
import { CS } from "@/services"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Character } from "@/types"

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  characters: Character[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

const columns: GridColDef<Character>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <Avatar entity={params.row} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 240,
    editable: false,
    sortable: true,
    renderCell: params => <CharacterLink character={params.row} />,
  },
  {
    field: "type",
    headerName: "Type",
    width: 110,
    editable: false,
    renderCell: params => CS.type(params.row),
  },
  {
    field: "archtype",
    headerName: "Archetype",
    width: 140,
    editable: false,
    renderCell: params => CS.archetype(params.row),
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 160,
    editable: false,
    renderCell: params => {
      const faction = CS.faction(params.row)
      if (faction) {
        return <FactionLink faction={faction} />
      }
      return null
    },
  },
  {
    field: "task",
    headerName: "Task",
    type: "boolean",
    width: 50,
    editable: false,
    renderCell: params => (CS.isTask(params.row) ? "Yes" : ""),
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
  const { characters } = formState.data
  const rows = characters.map(character => ({
    ...character,
    created_at: new Date(character.created_at),
  }))

  return (
    <BaseDataGrid
      formState={formState}
      dispatchForm={dispatchForm}
      columns={columns}
      rows={rows}
      sx={{ height: 800 }}
    />
  )
}
