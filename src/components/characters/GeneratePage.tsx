"use client"

import {
  Link,
  Stack,
  Box,
  Typography,
  Alert,
  useTheme,
  CircularProgress,
} from "@mui/material"
import { useCampaign, useClient } from "@/contexts"
import type {
  BackendErrorResponse,
  CableData,
  Character,
  CharacterJson,
} from "@/types/types"
import { FormActions, useForm } from "@/reducers"
import { AxiosError } from "axios"
import { Editor } from "@/components/editor"
import { HeroTitle, SaveButton, SaveCancelButtons } from "@/components/ui"
import { CS } from "@/services"
import { FormEvent, useState, useEffect } from "react"
import { Subscription } from "@rails/actioncable"
import { SpeedDial } from "@/components/characters"

type FormStateData = {
  description: string
  json: CharacterJson | null
  character: Character | null
}

export default function GeneratePage() {
  const { client } = useClient()
  const theme = useTheme()
  const consumer = client.consumer()
  const { campaign } = useCampaign()

  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    description: "",
    json: null,
    character: null,
  })
  const { saving, success, error } = formState
  const { description, json, character } = formState.data

  const [pending, setPending] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [subscription])

  async function handleSubmit() {
    dispatchForm({ type: FormActions.UPDATE, name: "character", value: null })
    dispatchForm({ type: FormActions.SUBMIT })
    setPending(true)
    try {
      const response = await client.generateAiCharacter({ description })

      const sub = consumer.subscriptions.create(
        { channel: "CampaignChannel", id: campaign?.id },
        {
          received: (data: CableData) => {
            if (data.status === "preview_ready" && data.json) {
              dispatchForm({
                type: FormActions.UPDATE,
                name: "json",
                value: data.json,
              })
              dispatchForm({
                type: FormActions.SUCCESS,
                payload: "Character generated successfully",
              })
              setPending(false)
              sub.unsubscribe()
            } else if (data.status === "error" && data.error) {
              handleError(new Error(data.error))
              setPending(false)
              sub.unsubscribe()
            }
          },
        }
      )
      setSubscription(sub)
    } catch (err) {
      handleError(err)
      setPending(false)
    }
  }

  async function generateCharacter() {
    try {
      if (!json) return

      dispatchForm({ type: FormActions.SUBMIT })

      let characterFromJson = CS.characterFromJson(json)

      if (json.faction) {
        const response = await client.getFactions({ search: json.faction })
        const faction = response.data.factions[0]
        characterFromJson = CS.updateFaction(characterFromJson, faction)
      }
      if (json.juncture) {
        const response = await client.getJunctures({
          search: json.juncture,
        })
        const juncture = response.data.junctures[0]
        characterFromJson = CS.updateJuncture(characterFromJson, juncture)
      }

      const response = await client.createCharacter({ ...characterFromJson })

      dispatchForm({
        type: FormActions.UPDATE,
        name: "character",
        value: response.data,
      })
      dispatchForm({
        type: FormActions.SUCCESS,
        payload: "Character saved successfully",
      })
    } catch (err) {
      handleError(err)
    }
  }

  function handleError(
    err: Error | AxiosError<BackendErrorResponse> | unknown
  ) {
    let errorMessage = "An unexpected error occurred"
    if (err instanceof AxiosError) {
      const backendError = err.response?.data as BackendErrorResponse
      if (backendError.error) {
        errorMessage = backendError.error
      } else if (backendError.errors) {
        errorMessage = Object.values(backendError.errors).flat().join(", ")
      } else if (backendError.name) {
        errorMessage = backendError.name.join(", ")
      }
    } else if (err instanceof Error) {
      errorMessage = err.message
    }
    dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    dispatchForm({ type: FormActions.UPDATE, name, value })
  }

  const cancelForm = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
  }

  return (
    <>
      <Box sx={{ mx: "auto", mt: 4, position: "relative" }}>
        <SpeedDial />
        <HeroTitle>Generate Characters</HeroTitle>
        {!json && !saving && !pending && (
          <Typography>Enter a description to generate a character</Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {(saving || pending) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 4,
              mb: 2,
            }}
          >
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {pending
                ? "Character generation pending..."
                : "Generating character..."}
            </Typography>
          </Box>
        )}
        {!saving && !pending && json && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5">Name: {json.name}</Typography>
            <Typography>Type: {json.type}</Typography>
            <Typography>Description: {json.description}</Typography>
            <Typography>
              {json.mainAttack}: {json.attackValue}
            </Typography>
            <Typography>Defense: {json.defense}</Typography>
            <Typography>Speed: {json.speed}</Typography>
            <Typography>Toughness: {json.toughness}</Typography>
            <Typography>Damage: {json.damage}</Typography>

            {!character && (
              <Stack spacing="2" direction="row" sx={{ mt: 2 }}>
                <SaveCancelButtons
                  cancelText="Clear"
                  saveText="Create Character"
                  onCancel={cancelForm}
                  onSave={generateCharacter}
                />
              </Stack>
            )}
            {character && (
              <Typography variant="h5" sx={{ mt: 2 }}>
                Character saved successfully!
                <br />
                <Link href={`/characters/${character.id}`} target="_blank">
                  {character.name}
                </Link>
              </Typography>
            )}
          </Box>
        )}
        {!character?.id && !saving && !pending && (
          <>
            <Box
              sx={{ my: 4 }}
              component="form"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Editor
                  name="description"
                  value={description}
                  onChange={handleChange}
                />
              </Box>
              <SaveCancelButtons
                disabled={saving}
                onCancel={() =>
                  dispatchForm({
                    type: FormActions.RESET,
                    payload: initialFormState,
                  })
                }
              />
            </Box>
          </>
        )}
        {character?.id && !saving && !pending && (
          <Box sx={{ mt: 2 }}>
            <SaveButton
              onClick={() =>
                dispatchForm({
                  type: FormActions.RESET,
                  payload: initialFormState,
                })
              }
            >
              Generate Another Character
            </SaveButton>
          </Box>
        )}
      </Box>
    </>
  )
}
