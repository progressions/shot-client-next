"use client"
import { GridColDef } from "@mui/x-data-grid"
import {
  FormStateType,
  FormStateAction,
  CharactersTableFormState,
} from "@/types"
import {
  BaseDataGrid,
  ArchetypeLink,
  EntityLink,
  FactionLink,
  CharacterLink,
} from "@/components/ui"
import { Box } from "@mui/material"
import { CS } from "@/services"
import { EntityAvatar } from "@/components/avatars"

interface ViewProps {
  formState: FormStateType<CharactersTableFormState>
  dispatchForm: (action: FormStateAction<CharactersTableFormState>) => void
}

const columns: GridColDef<Character>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <EntityAvatar entity={params.row} />
      </Box>
    ),
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
    renderCell: params => {
      const archetype = CS.archetype(params.row)
      if (archetype) {
        return <ArchetypeLink archetype={archetype} />
      }
      return null
    },
  },
  {
    field: "juncture",
    headerName: "Juncture",
    width: 160,
    editable: false,
    renderCell: params => {
      const juncture = params.row.juncture
      if (juncture) {
        return <EntityLink entity={juncture} />
      }
      return null
    },
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
