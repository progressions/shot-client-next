"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import { Stack, Box, IconButton, Typography, Grid } from "@mui/material"
import { useEffect } from "react"
import {
  type Option,
  SaveButton,
  TextField,
  Autocomplete,
  SectionHeader,
  ManageButton,
  Icon,
} from "@/components/ui"
import type { Character, SkillValue } from "@/types"
import { CS } from "@/services"
import { FormActions, useForm } from "@/reducers"

type FormStateData = {
  characterSkills: SkillValue[]
  skillName: string | null
  skillValue: number | null
  options: Option[]
  open: boolean
}

type SkillsManagerProps = {
  character: Character
  updateCharacter?: (character: Character) => void
}

export default function SkillsManager({
  character,
  updateCharacter,
}: SkillsManagerProps) {
  const skillNames = [
    "Deceit",
    "Detective",
    "Driving",
    "Fix-It",
    "Gambling",
    "Intimidation",
    "Intrusion",
    "Leadership",
    "Medicine",
    "Police",
    "Sabotage",
    "Seduction",
    "Constitution",
    "Will",
    "Notice",
    "Strength",
  ]
  const unknownSkills = skillNames.filter(
    (name: string) => (character.skills?.[name] as number) <= 7
  )
  const { formState, dispatchForm } = useForm<FormStateData>({
    characterSkills: CS.knownSkills(character),
    skillName: null,
    skillValue: null,
    options: unknownSkills.map(skill => ({
      label: skill,
      value: skill,
    })),
  })
  const { open, characterSkills, skillName, skillValue, options } =
    formState.data
  const disabled = !skillName || skillValue === null || skillName.trim() === ""

  // Sync characterSkills when character prop changes
  useEffect(() => {
    const currentSkills = CS.knownSkills(character)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "characterSkills",
      value: currentSkills,
    })
  }, [character.skills, dispatchForm])

  // Split skills into two even columns
  const midPoint = Math.ceil(characterSkills.length / 2)
  const leftColumnSkills = characterSkills.slice(0, midPoint)
  const rightColumnSkills = characterSkills.slice(midPoint)

  const fetchOptions = async (inputValue: string) => {
    return options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }

  const handleNameChange = (newValue: string | null) => {
    console.log("Selected skillName:", newValue)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "skillName",
      value: newValue,
    })
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    const newValue = inputValue === "" ? null : Number(inputValue)
    console.log("Selected skillValue:", newValue)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "skillValue",
      value: newValue,
    })
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Saving skillName:", skillName, "skillValue:", skillValue)
    if (skillName && skillValue !== null && skillName.trim() !== "") {
      const newSkill: SkillValue = [skillName.trim(), skillValue]
      const updatedSkills = [...characterSkills, newSkill]

      // Update character skills on the server
      if (updateCharacter) {
        const updatedCharacter = {
          ...character,
          skills: updatedSkills.reduce(
            (acc, [name, value]) => ({ ...acc, [name]: value }),
            {}
          ),
        }
        await updateCharacter(updatedCharacter)
      }

      // Update options if the skill is new
      if (!options.some(option => option.value === skillName)) {
        const newOption = { label: skillName.trim(), value: skillName.trim() }
        dispatchForm({
          type: FormActions.UPDATE,
          name: "options",
          value: [...options, newOption],
        })
      }
      // Update characterSkills in form state
      dispatchForm({
        type: FormActions.UPDATE,
        name: "characterSkills",
        value: updatedSkills,
      })
      // Reset form but keep visible
      dispatchForm({ type: FormActions.UPDATE, name: "skillName", value: null })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "skillValue",
        value: null,
      })
    }
  }

  const handleDelete = async (skillNameToDelete: string) => {
    const updatedSkills = characterSkills.filter(
      ([name]) => name !== skillNameToDelete
    )
    dispatchForm({
      type: FormActions.UPDATE,
      name: "characterSkills",
      value: updatedSkills,
    })
    if (updateCharacter) {
      const updatedCharacter = {
        ...character,
        skills: updatedSkills.reduce(
          (acc, [name, value]) => ({ ...acc, [name]: value }),
          {}
        ),
      }
      await updateCharacter(updatedCharacter)
    }
  }

  const openManager = (value: boolean) => {
    dispatchForm({ type: FormActions.UPDATE, name: "open", value })
  }

  const actionButton = (
    <ManageButton open={open} onClick={() => openManager(!open)} />
  )

  return (
    <>
      <SectionHeader
        title="Skills"
        icon={<Icon keyword="Skills" size="24" />}
        actions={actionButton}
      >
        Skills are what your character can do. They are used to resolve actions
        and challenges in the game.
      </SectionHeader>
      {open && (
        <Box>
          <Stack
            direction="row"
            spacing={2}
            component="form"
            onSubmit={handleSave}
          >
            <Box sx={{ width: 300 }}>
              <Autocomplete
                label="Add Skill"
                fetchOptions={fetchOptions}
                onChange={handleNameChange}
                value={skillName}
                freeSolo={true}
                allowNone={false}
              />
            </Box>
            <TextField
              label="Skill Value"
              type="number"
              value={skillValue === null ? "" : skillValue}
              onChange={handleValueChange}
              sx={{ width: 100 }}
              inputProps={{ min: 8 }}
            />
            <SaveButton disabled={disabled} />
          </Stack>
        </Box>
      )}
      <Grid container spacing={0}>
        <Grid sx={{ width: "50%", maxWidth: "50%", p: 1 }}>
          <Stack direction="column" spacing={0}>
            {leftColumnSkills.map((skill, index) => (
              <Box
                key={`left-${index}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography variant="body1">
                    {skill[0]}: {skill[1]}
                  </Typography>
                  {open && (
                    <IconButton
                      aria-label={`delete ${skill[0]}`}
                      onClick={() => handleDelete(skill[0])}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                  {!open && <Box sx={{ width: 40, height: 40 }} />}
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>
        <Grid sx={{ width: "50%", maxWidth: "50%", p: 1 }}>
          <Stack direction="column" spacing={0}>
            {rightColumnSkills.map((skill, index) => (
              <Box
                key={`right-${index}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography variant="body1">
                    {skill[0]}: {skill[1]}
                  </Typography>
                  {open && (
                    <IconButton
                      aria-label={`delete ${skill[0]}`}
                      onClick={() => handleDelete(skill[0])}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                  {!open && <Box sx={{ width: 40, height: 40 }} />}
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}
