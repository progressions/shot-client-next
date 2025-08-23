"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Typography,
  FormControl,
  FormHelperText,
  Stack,
  Box,
} from "@mui/material"
import type { Fight, Party, Faction } from "@/types"
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
  Manager,
} from "@/components/ui"
import { useCampaign, useClient } from "@/contexts"
import { FightChips, AddParty } from "@/components/fights"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

type FormStateData = {
  entity: Fight & {
    image?: File | null
  }
}

interface ShowProperties {
  fight: Fight
}

export default function Show({ fight: initialFight }: ShowProperties) {
  const { subscribeToEntity } = useCampaign()
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialFight,
    errors: {},
  })
  
  // Party state for AddParty component
  const [partyFormState, setPartyFormState] = useState({
    data: {
      filters: {},
      parties: [] as Party[],
      factions: [] as Faction[]
    }
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

  // Subscribe to fight updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("fight", data => {
      if (data && data.id === initialFight.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialFight.id, dispatchForm])

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
    // TODO: Implement join fight functionality
  }

  const handleChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: { ...fight, [name]: value },
    })
  }

  // Fetch parties for AddParty component
  const fetchParties = useCallback(async () => {
    try {
      const response = await client.getParties()
      setPartyFormState(prev => ({
        ...prev,
        data: {
          filters: prev.data.filters,
          parties: response.data.parties || [],
          factions: response.data.factions || []
        }
      }))
    } catch (error) {
      console.error("Failed to fetch parties:", error)
    }
  }, [client])

  // Handle party filter updates
  const handlePartyFiltersUpdate = useCallback((filters: Record<string, any>) => {
    setPartyFormState(prev => ({
      ...prev,
      data: {
        filters,
        parties: prev.data.parties,
        factions: prev.data.factions
      }
    }))
  }, [])

  // Handle adding party to fight
  const handlePartyAdd = useCallback(async (party: Party) => {
    try {
      // TODO: Implement API call to add party to fight
      console.log("Adding party to fight:", party.name)
    } catch (error) {
      console.error("Failed to add party to fight:", error)
    }
  }, [])

  // Fetch parties on component mount
  useEffect(() => {
    fetchParties()
  }, [fetchParties])

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
              value={fight.season || null}
              onChange={handleChangeLocal}
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
              value={fight.session || null}
              onChange={handleChangeLocal}
              onBlur={handleChangeAndSave}
              size="small"
            />
            {errors.session && (
              <FormHelperText>{errors.session}</FormHelperText>
            )}
          </FormControl>
        </Stack>
      </Box>
      <AddParty 
        formState={partyFormState}
        onFiltersUpdate={handlePartyFiltersUpdate}
        onPartyAdd={handlePartyAdd}
      />
      <Stack direction="column" spacing={2}>
        <Manager
          icon={<Icon keyword="Fighters" size="24" />}
          parentEntity={fight}
          childEntityName="Character"
          title="Fighters"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          onListUpdate={updateEntity}
          excludeIds={fight.character_ids || []}
        />
        <Manager
          icon={<Icon keyword="Vehicles" size="24" />}
          parentEntity={fight}
          childEntityName="Vehicle"
          title="Vehicles"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          onListUpdate={updateEntity}
          excludeIds={fight.vehicle_ids || []}
        />
      </Stack>
    </Box>
  )
}
