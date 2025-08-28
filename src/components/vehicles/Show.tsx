"use client"

import { useEffect } from "react"
import { FormControl, FormHelperText, Box, Stack } from "@mui/material"
import type { Vehicle } from "@/types"
import {
  InfoLink,
  Icon,
  SectionHeader,
  Alert,
  NameEditor,
  HeroImage,
  SpeedDialMenu,
} from "@/components/ui"
import { EntityActiveToggle } from "@/components/common"
import { useCampaign, useClient } from "@/contexts"
import {
  ActionValuesEdit,
  VehicleChips,
  Archetype,
} from "@/components/vehicles"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { Owner } from "@/components/characters"
import { EditFaction } from "@/components/factions"

type FormStateData = {
  entity: Vehicle & {
    image?: File | null
  }
}

interface ShowProperties {
  vehicle: Vehicle
}

export default function Show({ vehicle: initialVehicle }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialVehicle,
  })
  const { errors, status, data } = formState
  const vehicle = data.entity
  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(vehicle, dispatchForm)

  useEffect(() => {
    document.title = vehicle.name ? `${vehicle.name} - Chi War` : "Chi War"
  }, [vehicle.name])

  // Subscribe to vehicle updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("vehicle", data => {
      if (data && data.id === initialVehicle.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialVehicle.id, dispatchForm])

  const setVehicle = (updatedVehicle: Vehicle) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedVehicle,
    })
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={vehicle} setEntity={setVehicle} />
      <VehicleChips vehicle={vehicle} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={vehicle}
          setEntity={setVehicle}
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <Owner character={vehicle} />
      <SectionHeader title="Stats" icon={<Icon keyword="Action Values" />}>
        Stats are the core attributes that define a{" "}
        <InfoLink href="/vehicles" info="Vehicle" />
        &rsquo;s capabilities.
      </SectionHeader>
      <ActionValuesEdit
        entity={vehicle}
        setEntity={setVehicle}
        updateEntity={updateEntity}
      />
      <SectionHeader title="Details" icon={<Icon keyword="Personal Details" />}>
        Personal details provide additional context and background about a{" "}
        <InfoLink href="/vehicles" info="Vehicle" />.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Archetype vehicle={vehicle} updateEntity={updateEntity} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <EditFaction entity={vehicle} updateEntity={updateEntity} />
        </Box>
      </Stack>
      {(user?.admin || (campaign && user?.id === campaign.gamemaster_id)) && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this vehicle.
          </SectionHeader>
          <EntityActiveToggle
            entityType="Vehicle"
            entityId={vehicle.id}
            currentActive={vehicle.active ?? true}
            handleChangeAndSave={handleChangeAndSave}
          />
        </>
      )}
    </Box>
  )
}
