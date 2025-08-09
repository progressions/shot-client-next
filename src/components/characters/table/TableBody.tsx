import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { CharacterName } from "@/components/characters"
import { CS } from "@/services"
import type { Character } from "@/types"

interface CharactersTableBodyProps {
  characters: Character[]
  formatDate: (date: string) => string
}

export default function CharactersTableBody({
  characters,
  formatDate,
}: CharactersTableBodyProps) {
  return (
    <TableBody>
      {characters.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No characters available
          </TableCell>
        </TableRow>
      ) : (
        characters.map(character => (
          <TableRow
            key={character.id}
            sx={{ "&:hover": { bgcolor: "#616161" } }}
          >
            <TableCell
              sx={{
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Link
                href={`/characters/${character.id}`}
                style={{
                  color: "#ffffff",
                  textDecoration: "underline",
                }}
              >
                <CharacterName character={character} />
              </Link>
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "65px", sm: "150px" },
              }}
            >
              {CS.type(character)}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "65px", sm: "150px" },
              }}
            >
              {formatDate(character.created_at || "")}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "60px", sm: "100px" },
                textAlign: "center",
                padding: { xs: "8px 4px", sm: "16px 8px" },
              }}
            >
              {character.active ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
