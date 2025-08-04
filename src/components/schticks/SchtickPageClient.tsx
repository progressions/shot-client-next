"use client"

import { VscGithubAction } from "react-icons/vsc"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Box } from "@mui/material"
import type { Schtick } from "@/types"
import { useClient, useCampaign } from "@/contexts"
import { EditCategoryPath, CategoryPath } from "@/components/schticks"
import {
  EditableRichText,
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
} from "@/components/ui"
import { NameEditor } from "@/components/entities"
import { useEntity } from "@/hooks"

interface SchtickPageClientProperties {
  schtick: Schtick
}

export default function SchtickPageClient({
  schtick: initialSchtick,
}: SchtickPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [schtick, setSchtick] = useState<Schtick>(initialSchtick)
  const [error, setError] = useState<string | null>(null)
  const { updateEntity, handleDelete, handleChange } = useEntity(
    schtick,
    setSchtick
  )

  useEffect(() => {
    document.title = schtick.name ? `${schtick.name} - Chi War` : "Chi War"
  }, [schtick.name])

  useEffect(() => {
    if (
      campaignData?.schtick &&
      campaignData.schtick.id === initialSchtick.id
    ) {
      setSchtick(campaignData.schtick)
    }
  }, [campaignData, initialSchtick])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <NameEditor
          entity={schtick}
          setEntity={setSchtick}
          updateEntity={updateEntity}
        />
      </Box>
      <HeroImage entity={schtick} setEntity={setSchtick} />
      <CategoryPath schtick={schtick} />
      <EditCategoryPath
        schtick={schtick}
        setSchtick={setSchtick}
        updateEntity={updateEntity}
      />
      <SectionHeader title="Description" icon={<VscGithubAction size="24" />}>
        A description of the schtick, including whether it costs a Shot or Chi{" "}
        to activate, who it affects, and what its effects are.
      </SectionHeader>
      <EditableRichText
        name="description"
        html={schtick.description}
        editable={true}
        onChange={handleChange}
        fallback="No description available."
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
