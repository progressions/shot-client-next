"use client"

import FileDownloadIcon from "@mui/icons-material/FileDownload"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"

import { useRouter } from "next/navigation"
import type { Character } from "@/types"
import { useClient, useCampaign } from "@/contexts"
import { useState, useEffect } from "react"
import { Box, Stack } from "@mui/material"
import { SpeedDialMenu } from "@/components/ui"
import { CS } from "@/services"
import {
  Header,
  Owner,
  Associations,
  ActionValues,
  Skills,
  Weapons,
  Description,
  Schticks,
  Parties,
  Sites,
} from "@/components/characters"

type CharacterPageClientProps = {
  character: Character
}

export default function CharacterPageClient({
  character: initialCharacter,
}: CharacterPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const router = useRouter()

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
      router.push("/characters")
      console.log("redirected")
    } catch (error_) {
      console.error("Failed to delete character:", error_)
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

  const handleDuplicate = async () => {
    if (!character?.id) return

    try {
      const response = await client.duplicateCharacter(character)
      const newCharacter = response.data
      router.push(`/characters/${newCharacter.id}`)
    } catch (error_) {
      console.error("Failed to duplicate character:", error_)
    }
  }

  const actions = [
    { icon: <EditIcon />, name: "Edit", onClick: () => setEditOpen(true) },
    { icon: <FileDownloadIcon />, name: "Export", onClick: handleExport },
    { icon: <PeopleAltIcon />, name: "Copy", onClick: handleDuplicate },
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
      <Header character={character} />
      <Owner character={character} />
      <ActionValues character={character} />
      {!CS.isMook(character) && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            gap: { xs: 1, md: 2 },
            "& > *": {
              flex: { md: 1 }, // Each child takes equal width on desktop
              width: { xs: "100%", md: "50%" }, // Explicit width for clarity
            },
          }}
        >
          <Associations character={character} />
          <Skills character={character} />
        </Stack>
      )}
      <Description character={character} />
      <Weapons character={character} />
      {!CS.isMook(character) && (
        <Schticks character={character} setCharacter={setCharacter} />
      )}
      <Parties character={character} setCharacter={setCharacter} />
      {!CS.isMook(character) && (
        <Sites character={character} setCharacter={setCharacter} />
      )}
    </Box>
  )
}
