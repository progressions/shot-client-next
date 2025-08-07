"use client"

import { useEffect } from "react"
import {
  Typography,
  FormControl,
  FormHelperText,
  Stack,
  Box,
} from "@mui/material"
import type { Fight } from "@/types"
import {
  JoinFightButton,
  StartFightButton,
  NumberField,
  Alert,
  NameEditor,
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  EditableRichText,
  InfoLink,
  Icon,
} from "@/components/ui"
import { useCampaign } from "@/contexts"
import { FightChips } from "@/components/fights"
import { VehicleManager } from "@/components/vehicles"
import { CharacterManager } from "@/components/characters"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

type FormStateData = {
  entity: Fight & {
    image?: File | null
  }
}

interface FightPageClientProperties {
  fight: Fight
}

export default function FightPageClient({
  fight: initialFight,
}: FightPageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialFight,
    errors: {},
  })
  const { errors, status, data } = formState
  const fight = data.entity
  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    fight,
    dispatchForm
  )

  useEffect(() => {
    document.title = fight.name ? `${fight.name} - Chi War` : "Chi War"
  }, [fight.name])

  useEffect(() => {
    console.log("got campaignData", campaignData)
    if (campaignData?.fight && campaignData.fight.id === initialFight.id) {
      console.log("campaignData.fight", campaignData.fight)
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: { ...campaignData.fight },
      })
    }
  }, [campaignData, initialFight, dispatchForm])

  const setFight = (updatedFight: Fight) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedFight,
    })
  }

  const handleStartFight = () => {
    const updatedFight = {
      ...fight,
      started_at: new Date().toISOString(),
    }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedFight,
    })
    updateEntity(updatedFight)
  }

  const handleJoinFight = () => {
    console.log("Join fight clicked")
  }

  console.log("fight.image_url", fight.image_url)

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={fight} setEntity={setFight} />
      <FightChips fight={fight} />
      <StartFightButton fight={fight} onClick={handleStartFight} />
      <JoinFightButton fight={fight} onClick={handleJoinFight} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={fight}
          setEntity={setFight}
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <Box>
        <SectionHeader
          title="Description"
          icon={<Icon keyword="Description" />}
        >
          A brief description of the nature of the fight. What are the stakes?
          Where is it located?
        </SectionHeader>
        <FormControl fullWidth margin="normal" error={!!errors.description}>
          <EditableRichText
            name="description"
            html={fight.description}
            editable={true}
            onChange={handleChangeAndSave}
            fallback="No description available."
          />
          {errors.description && (
            <FormHelperText>{errors.description}</FormHelperText>
          )}
        </FormControl>
      </Box>
      <Box>
        <SectionHeader
          title="Details"
          icon={<Icon keyword="Details" />}
        ></SectionHeader>
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
          <FormControl margin="normal" error={!!errors.season}>
            <Typography variant="subtitle1" sx={{ fontSize: "0.75rem" }}>
              Season
            </Typography>
            <NumberField
              label="Season"
              name="season"
              value={fight.season || ""}
              onChange={e =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "season",
                  value: e.target.value,
                })
              }
              onBlur={handleChangeAndSave}
              size="small"
            />
            {errors.season && <FormHelperText>{errors.season}</FormHelperText>}
          </FormControl>
          <FormControl margin="normal" error={!!errors.session}>
            <Typography variant="subtitle1" sx={{ fontSize: "0.75rem" }}>
              Session
            </Typography>
            <NumberField
              label="Session"
              name="session"
              value={fight.session || ""}
              onChange={e =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "session",
                  value: e.target.value,
                })
              }
              onBlur={handleChangeAndSave}
              size="small"
            />
            {errors.session && (
              <FormHelperText>{errors.session}</FormHelperText>
            )}
          </FormControl>
        </Stack>
      </Box>
      <Stack direction="column" spacing={2}>
        <CharacterManager
          icon={<Icon keyword="Fighters" size="24" />}
          entity={fight}
          title="Fighters"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          updateParent={updateEntity}
        />
        <VehicleManager
          icon={<Icon keyword="Vehicles" size="24" />}
          entity={fight}
          title="Vehicles"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          updateParent={updateEntity}
        />
      </Stack>
    </Box>
  )
}
