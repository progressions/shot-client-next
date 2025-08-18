"use client"
import { useState } from "react"
import { GridColDef } from "@mui/x-data-grid"
import { Button, Chip, Box } from "@mui/material"
import { CheckCircle, PlayArrow } from "@mui/icons-material"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, CampaignLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Campaign } from "@/types"
import { useClient, useApp, useToast } from "@/contexts"

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

export default function View({ formState, dispatchForm }: ViewProps) {
  const { campaigns } = formState.data
  const { client } = useClient()
  const { campaign: currentCampaign, setCurrentCampaign } = useApp()
  const { toastSuccess, toastError } = useToast()
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null)

  const handleActivateCampaign = async (campaign: Campaign) => {
    if (campaign.id === currentCampaign?.id) return // Already active
    
    setLoadingCampaignId(campaign.id)
    try {
      await client.setCurrentCampaign(campaign)
      await setCurrentCampaign(campaign)
      toastSuccess(`Campaign "${campaign.name}" activated`)
    } catch (error) {
      console.error("Failed to activate campaign:", error)
      toastError("Failed to activate campaign")
    } finally {
      setLoadingCampaignId(null)
    }
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
    {
      field: "status",
      headerName: "Status",
      width: 120,
      editable: false,
      sortable: false,
      renderCell: params => {
        const isActive = params.row.id === currentCampaign?.id
        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isActive ? (
              <Chip
                icon={<CheckCircle />}
                label="Active"
                color="success"
                size="small"
              />
            ) : (
              <Chip
                label="Inactive"
                color="default"
                size="small"
              />
            )}
          </Box>
        )
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      editable: false,
      sortable: false,
      renderCell: params => {
        const isActive = params.row.id === currentCampaign?.id
        const isLoading = loadingCampaignId === params.row.id
        
        return (
          <Button
            variant={isActive ? "outlined" : "contained"}
            color={isActive ? "success" : "primary"}
            size="small"
            startIcon={isActive ? <CheckCircle /> : <PlayArrow />}
            onClick={() => handleActivateCampaign(params.row)}
            disabled={isActive || isLoading}
            sx={{ minWidth: 100 }}
          >
            {isLoading ? "..." : isActive ? "Active" : "Activate"}
          </Button>
        )
      },
    },
  ]

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
