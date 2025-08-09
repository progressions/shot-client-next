"use client"

import { useEffect } from "react"
import { FormControl, FormHelperText, Box } from "@mui/material"
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
import { useCampaign } from "@/contexts"
import { ActionValuesEdit, VehicleChips } from "@/components/vehicles"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { Owner } from "@/components/characters"

type FormStateData = {
  entity: Vehicle & {
    image?: File | null
  }
}

interface ShowProperties {
  vehicle: Vehicle
}

export default function Show({ vehicle: initialVehicle }: ShowProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialVehicle,
  })
  const { errors, status, data } = formState
  const vehicle = data.entity
  const { updateEntity, deleteEntity } = useEntity(vehicle, dispatchForm)

  useEffect(() => {
    document.title = vehicle.name ? `${vehicle.name} - Chi War` : "Chi War"
  }, [vehicle.name])

  useEffect(() => {
    console.log("got campaignData", campaignData)
    if (
      campaignData?.vehicle &&
      campaignData.vehicle.id === initialVehicle.id
    ) {
      console.log("campaignData.vehicle", campaignData.vehicle)
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: { ...campaignData.vehicle },
      })
    }
  }, [campaignData, initialVehicle, dispatchForm])

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
    </Box>
  )
}
