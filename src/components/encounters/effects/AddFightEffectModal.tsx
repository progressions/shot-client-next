"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
} from "@mui/material"
import CircleIcon from "@mui/icons-material/Circle"
import { useState } from "react"
import { useToast, useClient } from "@/contexts"
import { NumberField } from "@/components/ui"
import type { Effect, Encounter } from "@/types"

interface AddFightEffectModalProps {
  open: boolean
  onClose: () => void
  encounter: Encounter
}

type Severity = "error" | "warning" | "info" | "success"

const severityOptions: { value: Severity; label: string }[] = [
  { value: "error", label: "Danger (Red)" },
  { value: "warning", label: "Warning (Yellow)" },
  { value: "info", label: "Info (Blue)" },
  { value: "success", label: "Success (Green)" },
]

export default function AddFightEffectModal({
  open,
  onClose,
  encounter,
}: AddFightEffectModalProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Get the highest shot number from the encounter's shots
  const highestShot = encounter.shots?.length
    ? Math.max(...encounter.shots.map(s => s.shot))
    : 0

  const [saving, setSaving] = useState(false)
  const [effect, setEffect] = useState<Partial<Effect>>({
    name: "",
    description: "",
    severity: "info" as Severity,
    end_sequence: (encounter.sequence ?? 0) + 1,
    end_shot: highestShot,
  })

  const handleChange =
    (field: keyof Effect) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setEffect(prev => ({
        ...prev,
        [field]:
          field === "end_sequence" || field === "end_shot"
            ? value === ""
              ? null
              : Number(value)
            : value,
      }))
    }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const effectToSend: Partial<Effect> = {
        ...effect,
        name: effect.name || undefined,
        description: effect.description || undefined,
      }

      await client.createEffect(encounter, effectToSend as Effect)
      toastSuccess(
        effect.name ? `Added effect: ${effect.name}` : "Added fight effect"
      )

      // Touch the fight to trigger websocket update
      await client.touchFight(encounter)

      handleClose()
    } catch (error) {
      toastError("Failed to add effect")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setEffect({
      name: "",
      description: "",
      severity: "info" as Severity,
      end_sequence: (encounter.sequence ?? 0) + 1,
      end_shot: highestShot,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Fight Effect</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Effect Name"
              value={effect.name}
              onChange={handleChange("name")}
              onKeyDown={e => {
                if (e.key === "Enter" && !saving) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              fullWidth
              autoFocus
              placeholder="e.g., Building On Fire, Reinforcements Arriving"
            />
            <Stack direction="row" spacing={0.5}>
              {severityOptions.map(option => (
                <IconButton
                  key={option.value}
                  onClick={() =>
                    setEffect(prev => ({ ...prev, severity: option.value }))
                  }
                  sx={{
                    p: 0.25,
                    border: effect.severity === option.value ? 2 : 0,
                    borderColor:
                      effect.severity === option.value
                        ? "primary.main"
                        : "transparent",
                  }}
                  title={option.label}
                >
                  <CircleIcon
                    sx={{
                      color:
                        option.value === "error"
                          ? "error.main"
                          : option.value === "warning"
                            ? "warning.main"
                            : option.value === "info"
                              ? "info.main"
                              : "success.main",
                      fontSize: 24,
                    }}
                  />
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <TextField
            label="Description (Optional)"
            value={effect.description || ""}
            onChange={handleChange("description")}
            fullWidth
            multiline
            rows={2}
            placeholder="Details about the effect..."
          />

          <Stack direction="row" spacing={2}>
            <Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                End Sequence
              </Typography>
              <NumberField
                name="end_sequence"
                value={effect.end_sequence ?? ""}
                size="small"
                width="100px"
                error={false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  setEffect(prev => ({
                    ...prev,
                    end_sequence: val === "" ? null : Number(val),
                  }))
                }}
                onBlur={() => {}}
              />
            </Stack>
            <Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                End Shot
              </Typography>
              <NumberField
                name="end_shot"
                value={effect.end_shot ?? ""}
                size="small"
                width="100px"
                error={false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  setEffect(prev => ({
                    ...prev,
                    end_shot: val === "" ? null : Number(val),
                  }))
                }}
                onBlur={() => {}}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Adding..." : "Add Effect"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
