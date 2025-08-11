"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, CampaignLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Campaign } from "@/types"

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  campaigns: Campaign[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

const columns: GridColDef<Campaign>[] = [
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
    width: 350,
    editable: false,
    sortable: true,
    renderCell: params => <CampaignLink campaign={params.row} />,
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
  const { campaigns } = formState.data
  const rows = campaigns.map(campaign => ({
    ...campaign,
    created_at: new Date(campaign.created_at),
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
