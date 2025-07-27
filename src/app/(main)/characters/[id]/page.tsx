import { redirect } from "next/navigation"
import { Stack, Container, Typography, Box, Avatar } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import type { Faction, Character } from "@/types/types"
import type { Metadata } from "next"
import { CharacterName } from "@/components/characters"
import { UserName } from "@/components/users"
import { CS } from "@/services"
import Link from "next/link"
import { WeaponLink, ActionValueLink, WealthLink, JunctureLink, ArchetypeLink, TypeLink, FactionLink } from "@/components/links"

// Component for character not found
function CharacterNotFound() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
        <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
          Character Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          The character you’re looking for does not exist or is not accessible.
        </Typography>
      </Box>
    </Container>
  )
}

// Dynamically generate metadata for the page title
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    return { title: "Character - Chi War" }
  }

  const { id } = await params

  try {
    const response = await client.getCharacter({ id })
    const character: Character = response.data
    if (!character) {
      return { title: "Character Not Found - Chi War" }
    }
    return { title: `${character.name} - Chi War` }
  } catch (err) {
    console.error("Fetch character error for metadata:", err)
    return { title: "Character Not Found - Chi War" }
  }
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const { id } = await params

  let character: Character | null = null
  try {
    const response = await client.getCharacter({ id })
    character = response.data
    console.log("character data:", character)
  } catch (err) {
    console.error("Fetch character error:", err)
  }

  if (!character?.id) {
    return <CharacterNotFound />
  }

  // Debug stat box count and avatar
  console.log("Character layout:", {
    hasSecondaryAttack: !!CS.secondaryAttack(character),
    hasFortune: CS.fortune(character),
    totalBoxes: CS.secondaryAttack(character) ? 6 : 5,
    rowGap: { xs: "32px", sm: "24px" },
    columnGap: { xs: "16px", sm: "32px" },
    avatarSrc: character.image_url ?? "none"
  })

  const skillValues = CS.knownSkills(character)

  return (
    <Box sx={{ bgcolor: "#424242", p: { xs: 2, sm: 3 }, borderRadius: 1 }}>
      <Stack direction="row" sx={{ alignItems: "center", mb: 2, gap: { xs: 1, sm: 2 } }}>
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
              fontSize: { xs: "1.75rem", sm: "2.5rem" }
            }}
          >
            <CharacterName character={character} />
            {CS.isTask(character) && " (Task)"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}
          >
            { <TypeLink characterType={CS.type(character)} /> }
            { CS.faction(character) ? <>{' - '}<FactionLink faction={CS.faction(character) as Faction} /></> : null }
          </Typography>
        </Stack>
      </Stack>
      {character.user?.name && <Box sx={{mb: 2, fontSize: "0.8rem", textTransform: "uppercase"}}>
        <Link href={`/users/${character.user.id}`} passHref style={{ color: "#ffffff" }}>
          <UserName user={character.user} />
        </Link>
      </Box> }
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
              px: 2
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
                px: 2
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
              px: 2
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
              px: 2
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
              px: 2
            }}
          >
            {CS.speed(character)}
          </Box>
        </Stack>
        { CS.isPC(character) && (
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
                px: 2
              }}
            >
              {CS.fortune(character)}
            </Box>
          </Stack>
        )}
        { !CS.isPC(character) && (
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
                px: 2
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
          <strong>Archetype</strong> {CS.archetype(character) ? <ArchetypeLink archetype={CS.archetype(character)} /> : "None"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: { xs: "100%", sm: "50%" },
            boxSizing: "border-box",
          }}
        >
          <strong>Juncture</strong> {character.juncture?.id ? <JunctureLink juncture={character.juncture} /> : "None"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: { xs: "100%", sm: "50%" },
            boxSizing: "border-box",
          }}
        >
          <strong>Wealth</strong> {character.wealth ? <WealthLink wealth={character.wealth} /> : "Unknown"}
        </Typography>
      </Stack>
      <Stack direction="column">
        {skillValues.length > 0 && (
          <Typography variant="h6">
            Skills
          </Typography>
        )}
        <Stack direction="column">
          {skillValues.map((skill, index) => (
            <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
              {skill[0]}: {skill[1]}
            </Typography>
          ))}
        </Stack>
        {character.weapons.length > 0 && (<>
          <Typography variant="h6" mt={2}>
            Weapons
          </Typography>
          <Typography variant="body2" sx={{fontSize: "0.8rem"}}>
            (Damage/Concealment/Reload)
          </Typography>
        </>)}
        <Stack direction="column" mt={2}>
          {character.weapons.map((weapon, index) => (
            <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
              <WeaponLink weapon={weapon} />
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
