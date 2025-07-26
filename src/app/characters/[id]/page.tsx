import { redirect } from "next/navigation"
import { Container, Typography, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import type { Character } from "@/types/types"
import type { Metadata } from "next"
import { CharacterName } from "@/components/characters"

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

  try {
    const response = await client.getCharacter({ id })
    const character: Character = response.data

    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: "#ffffff", mb: 2 }}>
            <CharacterName character={character} />
          </Typography>
        </Box>
      </Container>
    )
  } catch (err) {
    console.error("Fetch character error:", err)
    return <CharacterNotFound />
  }
}
