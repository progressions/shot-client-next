"use client"

import FileDownloadIcon from "@mui/icons-material/FileDownload"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import { redirect } from "next/navigation"
import type { Character } from "@/types"
import { useClient, useCampaign } from "@/contexts"
import { useState, useEffect } from "react"
import { CS } from "@/services"
import { Avatar, Box, Stack, Typography } from "@mui/material"
import { HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterName } from "@/components/characters"
import {
  UserLink,
  WeaponLink,
  ActionValueLink,
  WealthLink,
  JunctureLink,
  ArchetypeLink,
  TypeLink,
  FactionLink,
} from "@/components/links"

type CharacterPageClientProps = {
  character: Character
}

export default function CharacterPageClient({
  character: initialCharacter,
}: CharacterPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const skillValues = CS.knownSkills(character)

  useEffect(() => {
    document.title = character.name ? `${character.name} - Chi War` : "Chi War"
  }, [character.name])

  useEffect(() => {
    if (
      campaignData?.character &&
      campaignData.character.id === initialCharacter.id
    ) {
      setCharacter(campaignData.character)
    }
  }, [campaignData, initialCharacter])

  const handleDelete = async () => {
    if (!character?.id) return
    if (
      !confirm(
        `Are you sure you want to delete the character: ${character.name}?`
      )
    )
      return

    try {
      await client.deleteCharacter(character)
      console.log("about to redirect")
      redirect("/characters")
      console.log("redirected")
    } catch (error_) {
      console.error("Failed to delete character:", error_)
      // setError("Failed to delete character.")
    }
  }

  const handleExport = async () => {
    try {
      const filename = `${character.name.replace(/\s+/g, "_")}.pdf`

      const response = await client.getCharacterPdf(character)
      const data = response.data
      const pdfBlob = new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")

      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading PDF:", error_)
      alert("Error downloading PDF")
    }
  }

  const actions = [
    { icon: <EditIcon />, name: "Edit", onClick: () => setEditOpen(true) },
    { icon: <FileDownloadIcon />, name: "Export", onClick: handleExport },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu actions={actions} />
      <HeroImage entity={character} />
      <Stack
        direction="row"
        sx={{ alignItems: "center", mb: 2, gap: { xs: 1, sm: 2 } }}
      >
        <Avatar
          src={character.image_url ?? undefined}
          alt={character.name}
          sx={{ width: { xs: 40, sm: 64 }, height: { xs: 40, sm: 64 } }}
        />
        <Stack direction="column">
          <Typography
            variant="h3"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1.75rem", sm: "2.5rem" },
            }}
          >
            <CharacterName character={character} />
            {CS.isTask(character) && " (Task)"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {<TypeLink characterType={CS.type(character)} />}
            {CS.faction(character) ? (
              <>
                {" - "}
                <FactionLink faction={CS.faction(character) as Faction} />
              </>
            ) : null}
          </Typography>
        </Stack>
      </Stack>
      {character.user?.name && (
        <Box sx={{ mb: 2, fontSize: "0.8rem", textTransform: "uppercase" }}>
          <UserLink user={character.user} />
        </Box>
      )}
      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          columnGap: { xs: 1, sm: 2 },
          rowGap: { xs: 1, sm: 1.5 },
          mb: 3,
        }}
      >
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            <ActionValueLink name={CS.mainAttack(character)} />
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {CS.mainAttackValue(character)}
          </Box>
        </Stack>
        {CS.secondaryAttack(character) && (
          <Stack direction="column">
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              <ActionValueLink name={CS.secondaryAttack(character)} />
            </Typography>
            <Box
              sx={{
                textAlign: "center",
                minWidth: { xs: "5rem", sm: "6rem" },
                fontSize: { xs: "2rem", sm: "3rem" },
                border: "1px solid #ffffff",
                borderRadius: 1,
                p: 1,
                px: 2,
              }}
            >
              {CS.secondaryAttackValue(character)}
            </Box>
          </Stack>
        )}
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            <ActionValueLink name="Defense" />
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {CS.defense(character)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            <ActionValueLink name="Toughness" />
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {CS.toughness(character)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            <ActionValueLink name="Speed" />
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {CS.speed(character)}
          </Box>
        </Stack>
        {CS.isPC(character) && (
          <Stack direction="column">
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              <ActionValueLink name={CS.fortuneType(character)} />
            </Typography>
            <Box
              sx={{
                textAlign: "center",
                minWidth: { xs: "5rem", sm: "6rem" },
                fontSize: { xs: "2rem", sm: "3rem" },
                border: "1px solid #ffffff",
                borderRadius: 1,
                p: 1,
                px: 2,
              }}
            >
              {CS.fortune(character)}
            </Box>
          </Stack>
        )}
        {!CS.isPC(character) && (
          <Stack direction="column">
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              <ActionValueLink name="Damage" />
            </Typography>
            <Box
              sx={{
                textAlign: "center",
                minWidth: { xs: "5rem", sm: "6rem" },
                fontSize: { xs: "2rem", sm: "3rem" },
                border: "1px solid #ffffff",
                borderRadius: 1,
                p: 1,
                px: 2,
              }}
            >
              {CS.damage(character)}
            </Box>
          </Stack>
        )}
      </Stack>
      <Stack
        direction="column"
        spacing={1}
        sx={{
          mb: 1,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: { xs: "100%", sm: "50%" },
            boxSizing: "border-box",
          }}
        >
          <strong>Archetype</strong>{" "}
          {CS.archetype(character) ? (
            <ArchetypeLink archetype={CS.archetype(character)} />
          ) : (
            "None"
          )}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: { xs: "100%", sm: "50%" },
            boxSizing: "border-box",
          }}
        >
          <strong>Juncture</strong>{" "}
          {character.juncture?.id ? (
            <JunctureLink juncture={character.juncture} />
          ) : (
            "None"
          )}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: { xs: "100%", sm: "50%" },
            boxSizing: "border-box",
          }}
        >
          <strong>Wealth</strong>{" "}
          {character.wealth ? (
            <WealthLink wealth={character.wealth} />
          ) : (
            "Unknown"
          )}
        </Typography>
      </Stack>
      <Stack direction="column">
        {skillValues.length > 0 && <Typography variant="h6">Skills</Typography>}
        <Stack direction="column">
          {skillValues.map((skill, index) => (
            <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
              {skill[0]}: {skill[1]}
            </Typography>
          ))}
        </Stack>
        {character.weapons.length > 0 && (
          <>
            <Typography variant="h6" mt={2}>
              Weapons
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              (Damage/Concealment/Reload)
            </Typography>
          </>
        )}
        <Stack direction="column" mt={2}>
          {character.weapons.map((weapon: Weapon, index: number) => (
            <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
              <WeaponLink weapon={weapon} />
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
