"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pagination, Box, Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, useMediaQuery, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import Link from "next/link"
import type { Character, PaginationMeta } from "@/types/types"
import { useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import type { SelectChangeEvent } from "@mui/material"
import { CharacterName } from "@/components/characters"
import { CS } from "@/services"
import { FormActions, useForm } from "@/reducers"
import { CharactersMobile } from "@/components/characters"
import { useCollection } from "@/hooks/useCollection"

interface CharactersProps {
  initialCharacters: Character[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
const validSorts: readonly ValidSort[] = ["name", "type", "created_at", "updated_at"]
type ValidOrder = "asc" | "desc"
const validOrders: readonly ValidOrder[] = ["asc", "desc"]

type FormStateData = {
  characters: Character[]
  meta: PaginationMeta
  sort: string
  order: string
}

export default function Characters({ initialCharacters, initialMeta, initialSort, initialOrder }: CharactersProps) {
  const { client } = useClient()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { formState, dispatchForm } = useForm<FormStateData>({
    characters: initialCharacters,
    meta: initialMeta,
    sort: initialSort,
    order: initialOrder
  })
  const { characters, meta, sort, order } = formState.data
  const fetchCharacters = useCallback(async (page: number = 1, sort: string = "name", order: string = "asc") => {
    try {
      const response = await client.getCharacters({ page, sort, order })
      dispatchForm({ type: FormActions.UPDATE, name: "characters", value: response.data.characters })
      dispatchForm({ type: FormActions.UPDATE, name: "meta", value: response.data.meta })
    } catch (err) {
      console.error("Fetch characters error:", err)
    }
  }, [client, dispatchForm])
  const { handlePageChange, handleSortChange, handleOrderChange, handleOrderChangeMobile, handleSortChangeMobile } = useCollection({
    url: "characters",
    fetch: fetchCharacters,
    sort, order, meta, dispatchForm, router, validSorts, validOrders
  })

  const formatDate = (date: string) => {
    if (isMobile) {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
    }
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isMobile) {
    return (
      <>
        <Typography
          variant="h4"
          sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 2 }}
        >
          Characters
        </Typography>
        <CharactersMobile
          characters={characters}
          meta={meta}
          sort={sort}
          order={order}
          onPageChange={handlePageChange}
          onSortChange={handleSortChangeMobile}
          onOrderChange={handleOrderChangeMobile}
        />
    </>
    )
  }

  return (
    <>
      <Typography
        variant="h4"
        sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 2 }}
      >
        Characters
      </Typography>
      <Box sx={{ bgcolor: "#424242", borderRadius: 1, overflowX: "auto" }}>
        <Table
          sx={{
            maxWidth: { xs: "400px", sm: "100%" },
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#ffffff" }}>
                <TableSortLabel
                  active={sort === "name"}
                  direction={sort === "name" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("name")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                <TableSortLabel
                  active={sort === "type"}
                  direction={sort === "type" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("type")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                <TableSortLabel
                  active={sort === "created_at"}
                  direction={sort === "created_at" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("created_at")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  color: "#ffffff",
                  width: { xs: "60px", sm: "100px" },
                  textAlign: "center",
                  padding: { xs: "8px 4px", sm: "16px 8px" }
                }}
              >
                Active
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {characters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
                  No characters available
                </TableCell>
              </TableRow>
            ) : (
              characters.map((character) => (
                <TableRow key={character.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Link href={`/characters/${character.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                      <CharacterName character={character} />
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {CS.type(character)}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {formatDate(character.created_at || "")}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      width: { xs: "60px", sm: "100px" },
                      textAlign: "center",
                      padding: { xs: "8px 4px", sm: "16px 8px" }
                    }}
                  >
                    {character.active ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="large"
        sx={{ mt: 2 }}
      />
  </>
  )
}
