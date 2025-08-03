"use client"

import { GiBrightExplosion } from "react-icons/gi"
import {
  Typography,
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { SectionHeader, TextField } from "@/components/ui"
import { InfoLink } from "@/components/links"
import type { Weapon } from "@/types"
import { FormActions, useForm } from "@/reducers"

type FormStateData = Weapon

type StatsProps = {
  weapon: Weapon
  updateWeapon: (weapon: Weapon) => Promise<void>
}

export default function Stats({
  weapon: initialWeapon,
  updateWeapon,
}: StatsProps) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    ...initialWeapon,
  })
  const weapon = formState.data
  const { kachunk, mook_bonus, damage, concealment, reload_value } =
    formState.data

  const handleChecked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: event.target.name,
      value: event.target.checked,
    })
    const updatedWeapon = {
      ...weapon,
      [event.target.name]: event.target.checked,
    }
    await updateWeapon(updatedWeapon)
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("event", event.target.name, event.target.value)
    dispatchForm({
      type: FormActions.UPDATE,
      name: event.target.name,
      value: event.target.value,
    })
    const updatedWeapon = { ...weapon, [event.target.name]: event.target.value }
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
      <Stack direction="row" spacing={2} my={2}>
        <TextField
          label="Damage"
          name="damage"
          value={damage || ""}
          type="number"
          onChange={handleChange}
          margin="normal"
          required
          sx={{ width: 120 }}
          InputProps={{
            sx: { fontSize: "2rem", fontWeight: "bold" },
          }}
        />
        <TextField
          label="Concealment"
          name="concealment"
          value={concealment || ""}
          type="number"
          onChange={handleChange}
          margin="normal"
          sx={{ width: 120 }}
          InputProps={{
            sx: { fontSize: "2rem" },
          }}
        />
        <TextField
          label="Reload"
          name="reload_value"
          value={reload_value || ""}
          type="number"
          onChange={handleChange}
          margin="normal"
          sx={{ width: 80 }}
          InputProps={{
            sx: { fontSize: "2rem" },
          }}
        />
        <TextField
          label="Mook Bonus"
          name="mook_bonus"
          type="number"
          value={mook_bonus}
          onChange={handleChange}
          sx={{ width: 100 }}
          InputProps={{
            sx: { fontSize: "2rem" },
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={kachunk}
              onChange={handleChecked}
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
