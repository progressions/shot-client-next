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
import { InfoLink } from "@/components/links"
import { Icon } from "@/lib"

interface SchtickPageClientProperties {
  schtick: Schtick
}

export default function SchtickPageClient({
  schtick: initialSchtick,
}: SchtickPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [schtick, setSchtick] = useState<Schtick>(initialSchtick)
  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
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
      <SpeedDialMenu onDelete={deleteEntity} />
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
      <SectionHeader title="Description" icon={<Icon keyword="Schtick" />}>
        A description of the Schtick, including whether it costs a {" "}
        <InfoLink info="Shot" />or <InfoLink info="Chi" />{" "}
        to activate, who it affects, and what its effects are.
      </SectionHeader>
      <EditableRichText
        name="description"
        html={schtick.description}
        editable={true}
        onChange={handleChangeAndSave}
        fallback="No description available."
      />
    </Box>
  )
}
