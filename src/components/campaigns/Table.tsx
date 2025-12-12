"use client"
import { useState } from "react"
import { GridColDef } from "@mui/x-data-grid"
import { Button, Chip, Box } from "@mui/material"
import { CheckCircle, PlayArrow, Stop } from "@mui/icons-material"
import {
  FormStateType,
  FormStateAction,
  FormActions,
  CampaignsTableFormState,
  Campaign,
} from "@/types"
import { BaseDataGrid, CampaignLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { useClient, useApp, useToast, useConfirm } from "@/contexts"
import { SeedingStatus } from "@/components/campaigns"

interface ViewProps {
  formState: FormStateType<CampaignsTableFormState>
  dispatchForm: (action: FormStateAction<CampaignsTableFormState>) => void
}

export default function View({ formState, dispatchForm }: ViewProps) {
  const { campaigns } = formState.data
  const { client } = useClient()
  const {
    campaign: currentCampaign,
    setCurrentCampaign,
    refreshUser,
  } = useApp()
  const { toastSuccess, toastError } = useToast()
  const { confirm } = useConfirm()
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(
    null
  )

  const handleActivateCampaign = async (campaign: Campaign) => {
    if (campaign.id === currentCampaign?.id) return // Already active

    setLoadingCampaignId(campaign.id)
    try {
      console.log("🚀 Starting campaign activation...")
      await client.setCurrentCampaign(campaign)
      console.log("✅ Campaign set via client")
      await setCurrentCampaign(campaign)
      console.log("✅ Campaign set via context")
      // Refresh user data to update onboarding progress after campaign activation
      console.log("🔄 Calling refreshUser...")
      await refreshUser()
      console.log("✅ RefreshUser completed")
      toastSuccess(`Campaign "${campaign.name}" activated`)
    } catch (error) {
      console.error("Failed to activate campaign:", error)
      toastError("Failed to activate campaign")
    } finally {
      setLoadingCampaignId(null)
    }
  }

  const handleDeactivateCampaign = async (campaign: Campaign) => {
    const confirmed = await confirm({
      title: "Deactivate Campaign",
      message: `Are you sure you want to deactivate the campaign "${campaign.name}"?`,
      confirmText: "Deactivate",
      confirmColor: "warning",
    })
    if (!confirmed) return

    setLoadingCampaignId(campaign.id)
    try {
      // Clear the current campaign - just unset it as current, don&rsquo;t change the campaign's active status
      await setCurrentCampaign(null)
      toastSuccess(
        `Campaign "${campaign.name}" is no longer your current campaign`
      )
      // Trigger a refetch by updating filters slightly and then back
      setTimeout(() => {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "filters",
          value: {
            ...formState.data.filters,
            page: formState.data.filters.page, // This will trigger the useEffect in List component
          },
        })
      }, 100)
    } catch (error) {
      console.error("Failed to deactivate campaign:", error)
      toastError("Failed to deactivate campaign")
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
      renderCell: params => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <EntityAvatar entity={params.row} />
        </Box>
      ),
      align: "center",
      headerAlign: "center",
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
        const campaign = params.row as Campaign
        const isCurrentCampaign = campaign.id === currentCampaign?.id
        const isActive = campaign.active !== false // active can be true or null/undefined
        const isSeeding =
          campaign.is_seeding ||
          (campaign.seeding_status && campaign.seeding_status !== "complete")
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {isSeeding ? (
              <SeedingStatus campaign={campaign} variant="chip" />
            ) : isCurrentCampaign ? (
              <Chip
                icon={<CheckCircle />}
                label="Current"
                color="success"
                size="small"
              />
            ) : isActive ? (
              <Chip label="Active" color="primary" size="small" />
            ) : (
              <Chip label="Inactive" color="default" size="small" />
            )}
          </Box>
        )
      },
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      editable: false,
      sortable: false,
      renderCell: params => {
        const campaign = params.row as Campaign
        const isCurrentCampaign = campaign.id === currentCampaign?.id
        const isLoading = loadingCampaignId === campaign.id
        const isSeeding =
          campaign.is_seeding ||
          (campaign.seeding_status && campaign.seeding_status !== "complete")

        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {!isCurrentCampaign && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<PlayArrow />}
                onClick={() => handleActivateCampaign(campaign)}
                disabled={isLoading || isSeeding}
                sx={{ minWidth: 100 }}
              >
                {isLoading ? "..." : isSeeding ? "Seeding..." : "Activate"}
              </Button>
            )}
            {isCurrentCampaign && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<Stop />}
                onClick={() => handleDeactivateCampaign(campaign)}
                disabled={isLoading}
                sx={{ minWidth: 100 }}
              >
                {isLoading ? "..." : "Deactivate"}
              </Button>
            )}
          </Box>
        )
      },
      align: "center",
      headerAlign: "center",
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
