"use client"

import { GiSwordman } from "react-icons/gi"
import { GiSpikyExplosion } from "react-icons/gi"
import { useState, useEffect } from "react"
import { Stack, Box } from "@mui/material"
import type { Fight } from "@/types"
import {
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  EditableRichText,
} from "@/components/ui"
import { useCampaign } from "@/contexts"
import { VehiclesList } from "@/components/fights"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"
import { NameEditor } from "@/components/entities"
import { useEntity } from "@/hooks"

interface FightPageClientProperties {
  fight: Fight
}

export default function FightPageClient({
  fight: initialFight,
}: FightPageClientProperties) {
  const { campaignData } = useCampaign()
  const [fight, setFight] = useState<Fight>(initialFight)
  const {
    updateEntity: updateFight,
    deleteEntity,
    handleChange,
  } = useEntity(fight, setFight)

  useEffect(() => {
    document.title = fight.name ? `${fight.name} - Chi War` : "Chi War"
  }, [fight.name])

  useEffect(() => {
    if (campaignData?.fight && campaignData.fight.id === initialFight.id) {
      setFight(campaignData.fight)
    }
  }, [campaignData, initialFight])

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
          entity={fight}
          setEntity={setFight}
          updateEntity={updateFight}
        />
      </Box>
      <HeroImage entity={fight} setEntity={setFight} />
      <SectionHeader title="Description" icon={<GiSpikyExplosion size="24" />}>
        A brief description of the nature of the fight. What are the stakes?
        Where is it located?
      </SectionHeader>
      <EditableRichText
        name="description"
        html={fight.description}
        editable={true}
        onChange={handleChange}
        fallback="No description available."
      />
      <Stack direction="column" spacing={2}>
        <CharacterManager
          icon={<GiSwordman size="24" />}
          name="fight"
          title="Fighters"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          entity={fight}
          update={updateFight}
        />
        <VehiclesList fight={fight} setFight={setFight} />
      </Stack>
    </Box>
  )
}
