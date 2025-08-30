import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Faction, Character } from "@/types"
import { defaultCharacter } from "@/types"
import { useState, useEffect } from "react"
import { EntityAvatar } from "@/components/avatars"
import CS from "@/services/CharacterService"
import GamemasterOnly from "@/components/GamemasterOnly"
import { RichTextRenderer } from "@/components/editor"
import { useClient } from "@/contexts/AppContext"
import CharacterLink from "../ui/links/CharacterLink"
import ArchetypeLink from "../ui/links/ArchetypeLink"
import TypeLink from "../ui/links/TypeLink"
import FactionLink from "../ui/links/FactionLink"

export default function CharacterPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [character, setCharacter] = useState<Character>(defaultCharacter)

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await client.getCharacter({ id })
        const fetchedCharacter = response.data
        if (fetchedCharacter) {
          setCharacter(fetchedCharacter)
        } else {
          console.error(`Character with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching character:", error)
      }
    }

    if (user?.id && id) {
      fetchCharacter().catch(error => {
        console.error("Failed to fetch character:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  const description = CS.isPC(character)
    ? CS.melodramaticHook(character)
    : CS.description(character)

  if (!character?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Loading...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <EntityAvatar entity={character} disablePopup={true} />
        <Typography variant="h6">
          <CharacterLink character={character} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography
        component="div"
        variant="caption"
        sx={{ textTransform: "uppercase" }}
      >
        {CS.type(character) && <TypeLink characterType={CS.type(character)} />}
        {CS.archetype(character) && (
          <>
            {" - "}
            <ArchetypeLink archetype={CS.archetype(character)} />
          </>
        )}
        {CS.faction(character) && (
          <>
            {" - "}
            <FactionLink faction={CS.faction(character) as Faction} />
          </>
        )}
      </Typography>
      {description && (
        <Box mt={1}>
          <RichTextRenderer html={description} />
        </Box>
      )}
      <GamemasterOnly user={user}>
        <Box mt={1}>
          <Typography variant="body2">
            {CS.mainAttack(character) && CS.mainAttackValue(character) > 0 && (
              <>
                <strong>{CS.mainAttack(character)}</strong>{" "}
                {CS.mainAttackValue(character)}{" "}
              </>
            )}
            {CS.secondaryAttack(character) &&
              CS.secondaryAttackValue(character) > 0 && (
                <>
                  <strong>{CS.secondaryAttack(character)}</strong>{" "}
                  {CS.secondaryAttackValue(character)}{" "}
                </>
              )}
            {CS.defense(character) > 0 && (
              <>
                <strong>Defense</strong> {CS.defense(character)}{" "}
              </>
            )}
          </Typography>
          <Typography variant="body2">
            {CS.toughness(character) > 0 && (
              <>
                <strong>Toughness</strong> {CS.toughness(character)}{" "}
              </>
            )}
            {CS.speed(character) > 0 && (
              <>
                <strong>Speed</strong> {CS.speed(character)}{" "}
              </>
            )}
            {CS.damage(character) > 0 && (
              <>
                <strong>Damage</strong> {CS.damage(character)}{" "}
              </>
            )}
          </Typography>
        </Box>
      </GamemasterOnly>
    </Box>
  )
}
