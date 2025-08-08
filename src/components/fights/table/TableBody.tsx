import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { FightName } from "@/components/fights"
import type { Fight } from "@/types"

interface FightsTableBodyProps {
  fights: Fight[]
  formatDate: (date: string) => string
}

export default function FightsTableBody({
  fights,
  formatDate,
}: FightsTableBodyProps) {
  return (
    <TableBody>
      {fights.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No fights available
          </TableCell>
        </TableRow>
      ) : (
        fights.map(fight => (
          <TableRow key={fight.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
            <TableCell
              sx={{
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Link
                href={`/fights/${fight.id}`}
                style={{
                  color: "#ffffff",
                  textDecoration: "underline",
                }}
              >
                <FightName fight={fight} />
              </Link>
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "65px", sm: "150px" },
              }}
            >
              {formatDate(fight.created_at || "")}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
