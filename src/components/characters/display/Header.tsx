import type { Character } from "@/types"
import { Avatar, Stack, Typography } from "@mui/material"
import { HeroImage } from "@/components/ui"
import { CS } from "@/services"
import { CharacterName } from "@/components/characters"
import { TypeLink, FactionLink } from "@/components/ui"

type HeaderProps = {
  character: Character
}

export default function Header({ character }: HeaderProps) {
  return (
    <>
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
    </>
  )
}
