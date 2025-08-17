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
import { InfoLink, SectionHeader, TextField } from "@/components/ui"
import type { Weapon } from "@/types"
import { FormActions, useForm, type FormStateType } from "@/reducers"

type FormStateData = {
  weapon: Weapon
}

type StatsProps = {
  weapon: Weapon
  updateWeapon: (weapon: Weapon) => Promise<void>
  state?: FormStateType<FormStateData>
}

export default function Stats({
  weapon: initialWeapon,
  updateWeapon,
  state,
}: StatsProps) {
  // internal state for these stats values
  const { formState, dispatchForm } = useForm<FormStateData>({
    weapon: initialWeapon,
  })

  // Sync local state with weapon prop changes from WebSocket
  useEffect(() => {
    dispatchForm({
      type: FormActions.RESET,
      value: { weapon: initialWeapon },
    })
  }, [initialWeapon, dispatchForm])

  // Safety check to prevent undefined errors
  if (!formState?.data?.weapon) {
    return null
  }

  const weapon = formState.data.weapon
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
      name: "weapon",
      value: updatedWeapon,
    })
    await updateWeapon(updatedWeapon)
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedWeapon = { ...weapon, [event.target.name]: event.target.value }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapon",
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
        <FormControl fullWidth margin="normal" error={!!errors.damage}>
          <TextField
            label="Damage"
            name="damage"
            value={damage || ""}
            type="number"
            onChange={handleChange}
            margin="normal"
            required
            disabled={saving}
            sx={{ width: 120 }}
            InputProps={{
              sx: { fontSize: "2rem", fontWeight: "bold" },
            }}
          />
          {errors.damage && <FormHelperText>{errors.damage}</FormHelperText>}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.concealment}>
          <TextField
            label="Concealment"
            name="concealment"
            value={concealment || ""}
            type="number"
            onChange={handleChange}
            margin="normal"
            disabled={saving}
            sx={{ width: 120 }}
            InputProps={{
              sx: { fontSize: "2rem" },
            }}
          />
          {errors.concealment && (
            <FormHelperText>{errors.concealment}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.reload_value}>
          <TextField
            label="Reload"
            name="reload_value"
            value={reload_value || ""}
            type="number"
            onChange={handleChange}
            margin="normal"
            sx={{ width: 120 }}
            disabled={saving}
            InputProps={{
              sx: { fontSize: "2rem" },
            }}
          />
          {errors.reload_value && (
            <FormHelperText>{errors.reload_value}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.mook_bonus}>
          <TextField
            label="Mook Bonus"
            name="mook_bonus"
            type="number"
            value={mook_bonus}
            onChange={handleChange}
            disabled={saving}
            sx={{ width: 100 }}
            InputProps={{
              sx: { fontSize: "2rem" },
            }}
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
