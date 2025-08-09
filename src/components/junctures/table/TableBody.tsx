"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { JunctureName } from "@/components/junctures"
import type { Juncture } from "@/types"

interface JuncturesTableBodyProps {
  junctures: Juncture[]
  formatDate: (date: string) => string
}

export default function JuncturesTableBody({
  junctures,
  formatDate,
}: JuncturesTableBodyProps) {
  return (
    <TableBody>
      {junctures.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No junctures available
          </TableCell>
        </TableRow>
      ) : (
        junctures.map(juncture => (
          <TableRow
            key={juncture.id}
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
                href={`/junctures/${juncture.id}`}
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <JunctureName juncture={juncture} />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {formatDate(juncture.created_at || "")}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "60px", sm: "100px" },
                textAlign: "center",
                padding: { xs: "8px 4px", sm: "16px 8px" },
              }}
            >
              {juncture.active ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
