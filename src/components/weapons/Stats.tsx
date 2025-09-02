"use client"

import { GiBrightExplosion } from "react-icons/gi"
import { useEffect } from "react"
import {
  FormControl,
  FormHelperText,
  Typography,
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { InfoLink, SectionHeader, NumberField } from "@/components/ui"
import type { Weapon } from "@/types"
import { FormActions, useForm, type FormStateType } from "@/reducers"

type FormStateData = {
  entity: Weapon
}

type StatsProps = {
  weapon: Weapon
  updateWeapon: (weapon: Weapon) => Promise<void>
  handleChangeAndSave: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>
  ) => Promise<void>
  state?: FormStateType<FormStateData>
}

export default function Stats({
  weapon: initialWeapon,
  updateWeapon,
  handleChangeAndSave,
  state,
}: StatsProps) {
  // internal state for these stats values
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialWeapon,
  })

  // Sync local state with weapon prop changes from WebSocket
  useEffect(() => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: initialWeapon,
    })
  }, [initialWeapon, dispatchForm])

  // Safety check to prevent undefined errors
  if (!formState?.data?.entity) {
    return null
  }

  const weapon = formState.data.entity
  const { kachunk, mook_bonus, damage, concealment, reload_value } = weapon

  // external state for overall form
  const { saving, errors } = state || {}

  const handleChecked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedWeapon = {
      ...weapon,
      [event.target.name]: event.target.checked,
    }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedWeapon,
    })
    await updateWeapon(updatedWeapon)
  }

  return (
    <Box>
      <SectionHeader
        title="Weapon Stats"
        icon={<GiBrightExplosion size="24" />}
      >
        Typical weapon <InfoLink info="Damage" /> is 9, only extreme weapons are
        12 or higher. For <InfoLink info="Concealment" /> and{" "}
        <InfoLink info="Reload" />, lower is better.
      </SectionHeader>
      <Stack direction="row" spacing={2} my={2} alignItems="center">
        <FormControl margin="normal" error={!!errors.damage}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Damage
          </Typography>
          <NumberField
            name="damage"
            value={damage || 0}
            size="large"
            width="120px"
            error={!!errors.damage}
            onChange={handleChangeAndSave}
            onBlur={handleChangeAndSave}
          />
          {errors.damage && <FormHelperText>{errors.damage}</FormHelperText>}
        </FormControl>
        <FormControl margin="normal" error={!!errors.concealment}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Concealment
          </Typography>
          <NumberField
            name="concealment"
            value={concealment || 0}
            size="large"
            width="120px"
            error={!!errors.concealment}
            onChange={handleChangeAndSave}
            onBlur={handleChangeAndSave}
          />
          {errors.concealment && (
            <FormHelperText>{errors.concealment}</FormHelperText>
          )}
        </FormControl>
        <FormControl margin="normal" error={!!errors.reload_value}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Reload
          </Typography>
          <NumberField
            name="reload_value"
            value={reload_value || 0}
            size="large"
            width="120px"
            error={!!errors.reload_value}
            onChange={handleChangeAndSave}
            onBlur={handleChangeAndSave}
          />
          {errors.reload_value && (
            <FormHelperText>{errors.reload_value}</FormHelperText>
          )}
        </FormControl>
        <FormControl margin="normal" error={!!errors.mook_bonus}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Mook Bonus
          </Typography>
          <NumberField
            name="mook_bonus"
            value={mook_bonus || 0}
            size="large"
            width="120px"
            error={!!errors.mook_bonus}
            onChange={handleChangeAndSave}
            onBlur={handleChangeAndSave}
          />
          {errors.mook_bonus && (
            <FormHelperText>{errors.mook_bonus}</FormHelperText>
          )}
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={kachunk}
              onChange={handleChecked}
              disabled={saving}
              name="kachunk"
            />
          }
          label="Kachunk"
        />
      </Stack>
      <Typography>
        A Mook Bonus means you add the bonus to your{" "}
        <InfoLink info="Action Value" /> when fighting a{" "}
        <InfoLink info="Mook" />. Damage Value for a Weapon with Kachunk is 14
        if you take an extra shot to dramatically go &quot;KA-CHUNK!&quot;.
      </Typography>
    </Box>
  )
}
