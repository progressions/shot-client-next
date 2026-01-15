"use client"

import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import DeleteIcon from "@mui/icons-material/Delete"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Menu,
  MenuItem,
} from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent, SyntheticEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Character } from "@/types"
import { isAiGenerationEnabled } from "@/types"
import { CS } from "@/services"
import { useClient, useConfirm, useCampaign } from "@/contexts"
import { Extend } from "@/components/characters"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
  disabled?: boolean
}

type CharacterSpeedDialProps = {
  character: Character
  sx?: SystemStyleObject<Theme>
  onCharacterUpdate?: (character: Character) => void
}

export default function CharacterSpeedDial({
  character,
  sx = {},
  onCharacterUpdate,
}: CharacterSpeedDialProps) {
  const isExtending = character.extending ?? false
  const { client } = useClient()
  const { confirm } = useConfirm()
  const { campaign } = useCampaign()
  const aiEnabled = isAiGenerationEnabled(campaign)

  const router = useRouter()
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const exportMenuOpen = Boolean(exportAnchorEl)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [persist, setPersist] = useState(false)
  const [extendOpen, setExtendOpen] = useState(false)

  // Reset persist when SpeedDial is closed externally
  useEffect(() => {
    if (!speedDialOpen) {
      setPersist(false)
    }
  }, [speedDialOpen])

  const handleDeleteClick = async () => {
    await handleDelete(false)
  }

  const handleDelete = async (force = false) => {
    if (!character?.id) return

    if (!force) {
      const confirmed = await confirm({
        title: "Delete Character",
        message: `Are you sure you want to delete the character: ${character.name || "Unnamed"}?`,
        confirmText: "Delete",
        destructive: true,
      })
      if (!confirmed) return
    }

    try {
      await client.deleteCharacter(character, { force })
      router.push("/characters")
    } catch (error_) {
      console.error("Failed to delete character:", error_)

      // Handle 422 response with association details
      if (
        error_.response?.status === 422 &&
        error_.response?.data?.error_type === "associations_exist"
      ) {
        const { constraints } = error_.response.data
        const constraintsList = Object.entries(constraints)
          .map(
            ([_key, data]: [string, { count: number; label: string }]) =>
              `• ${data.count} ${data.label}`
          )
          .join("\n")

        const message = `Cannot delete ${character.name || "this character"} because it has:\n\n${constraintsList}\n\nThese associations must be removed first, or you can force delete which will remove all associations.\n\nForce delete and remove all associations?`

        const forceConfirmed = await confirm({
          title: "Force Delete Character?",
          message,
          confirmText: "Force Delete",
          destructive: true,
        })
        if (forceConfirmed) {
          await handleDelete(true)
        }
      } else {
        alert(
          `Failed to delete character: ${error_.message || "Unknown error"}`
        )
      }
    }
  }

  const handleExportPDF = async () => {
    setExportingPdf(true)
    try {
      const filename = `${(character.name || "character").replace(/\s+/g, "_")}.pdf`
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
    } finally {
      setExportingPdf(false)
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
    }
  }

  const handleExportTXT = async () => {
    try {
      const filename = `${(character.name || "character").replace(/\s+/g, "_")}.txt`
      const textContent = `
Character: ${character.name || "Unnamed"}
ID: ${character.id}
Owner: ${character.owner || "N/A"}
Description: ${character.description || "N/A"}
${!CS.isMook(character) ? `Schticks: ${character.schticks?.join(", ") || "None"}` : ""}
Action Values: ${JSON.stringify(character.actionValues, null, 2)}
      `.trim()
      const txtBlob = new Blob([textContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(txtBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading TXT:", error_)
      alert("Error downloading TXT")
    } finally {
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
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
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const handleExportClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportMenuClose = () => {
    setExportAnchorEl(null)
  }

  const handleExtend = () => {
    setExtendOpen(true)
  }

  const actions = [
    {
      icon: <FileDownloadIcon />,
      name: "Export",
      onClick: handleExportClick,
      preventClose: true,
    },
    { icon: <PeopleAltIcon />, name: "Copy", onClick: handleDuplicate },
    // Only show Extend action when AI generation is enabled
    ...(aiEnabled
      ? [
          {
            icon: isExtending ? (
              <HourglassEmptyIcon />
            ) : (
              <AccessibilityNewIcon />
            ),
            name: isExtending ? "Extending..." : "Extend",
            onClick: handleExtend,
            disabled: isExtending,
          },
        ]
      : []),
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDeleteClick },
  ]

  const handleActionClick =
    (action: Action) => (event: MouseEvent<HTMLElement>) => {
      // Don't do anything if the action is disabled
      if (action.disabled) {
        event.stopPropagation()
        return
      }

      if (action.preventClose) {
        event.stopPropagation()
        setPersist(true)
      } else {
        setPersist(false)
        setSpeedDialOpen(false)
      }
      if (action.onClick) {
        action.onClick(event)
      }
    }

  const handleOpen = (_event: SyntheticEvent, reason: string) => {
    if (reason !== "toggle") {
      return
    }

    setSpeedDialOpen(true)
  }

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason === "escapeKeyDown") {
      setPersist(false)
      setSpeedDialOpen(false)
      return
    }

    if (reason !== "toggle") {
      return
    }

    if (persist) {
      setPersist(false)
      return
    }

    setSpeedDialOpen(false)
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Character actions"
        sx={{
          position: "absolute",
          right: 0,
          "& .MuiSpeedDial-fab": {
            width: 36,
            height: 36,
            minHeight: 36,
            boxShadow: "none",
          },
          ...sx,
        }}
        icon={<SpeedDialIcon openIcon={<MoreHorizIcon />} />}
        direction="down"
        open={speedDialOpen}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={handleActionClick(action)}
            FabProps={{
              disabled: action.disabled,
              sx: action.disabled
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {},
            }}
          />
        ))}
      </SpeedDial>
      <Menu
        anchorEl={exportAnchorEl}
        open={exportMenuOpen}
        onClose={handleExportMenuClose}
        MenuListProps={{
          "aria-labelledby": "export-button",
        }}
      >
        <MenuItem onClick={handleExportPDF}>
          {exportingPdf ? "Exporting..." : "Export as PDF"}
        </MenuItem>
        <MenuItem onClick={handleExportTXT}>Export as TXT</MenuItem>
      </Menu>
      <Extend
        character={character}
        open={extendOpen}
        onClose={() => setExtendOpen(false)}
        onCharacterUpdate={onCharacterUpdate}
      />
    </>
  )
}
