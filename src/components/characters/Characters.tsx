"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pagination, Box, Typography, Container, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, useMediaQuery, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import Link from "next/link"
import type { Character, PaginationMeta } from "@/types/types"
import { useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import type { SelectChangeEvent } from "@mui/material"
import { CharacterName } from "@/components/characters"

interface CharactersProps {
  initialCharacters: Character[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
}

type ValidSort = "name" | "created_at" | "updated_at"
const validSorts: readonly ValidSort[] = ["name", "created_at", "updated_at"]
type ValidOrder = "asc" | "desc"
const validOrders: readonly ValidOrder[] = ["asc", "desc"]

// Mobile-specific component
function CharactersMobile({
  characters,
  meta,
  sort,
  order,
  onPageChange,
  onSortChange,
  onOrderChange
}: {
  characters: Character[]
  meta: PaginationMeta
  sort: string
  order: string
  onPageChange: (_event: React.ChangeEvent<unknown>, page: number) => void
  onSortChange: (event: SelectChangeEvent<string>) => void
  onOrderChange: () => void
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sort}
            label="Sort By"
            onChange={onSortChange}
            sx={{ color: "#ffffff", "& .MuiSvgIcon-root": { color: "#ffffff" } }}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="created_at">Created</MenuItem>
            <MenuItem value="updated_at">Updated</MenuItem>
          </Select>
        </FormControl>
        <Typography
          onClick={onOrderChange}
          sx={{
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "0.875rem",
            textDecoration: "underline"
          }}
        >
          {order === "asc" ? "↑ Asc" : "↓ Desc"}
        </Typography>
      </Box>
      {characters.length === 0 ? (
        <Typography sx={{ color: "#ffffff" }}>No characters available</Typography>
      ) : (
        characters.map((character) => (
          <Card key={character.id} sx={{ bgcolor: "#424242", color: "#ffffff" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body1">
                <Link href={`/characters/${character.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                  <CharacterName character={character} />
                </Link>
              </Typography>
              <Typography variant="body2">Created: {formatDate(character.created_at || "")}</Typography>
              <Typography variant="body2">Updated: {formatDate(character.updated_at || "")}</Typography>
              <Typography variant="body2">Active: {character.active ? "Yes" : "No"}</Typography>
            </CardContent>
          </Card>
        ))
      )}
      <Pagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={onPageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size={isMobile ? "small" : "large"}
        sx={{ mt: 2 }}
      />
    </Stack>
  )
}

export default function Characters({ initialCharacters, initialMeta, initialSort, initialOrder }: CharactersProps) {
  const { client } = useClient()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta)
  const [sort, setSort] = useState<string>(initialSort)
  const [order, setOrder] = useState<string>(initialOrder)

  // Debug mobile detection and table widths
  useEffect(() => {
    console.log("isMobile:", isMobile, "Screen width:", window.innerWidth)
    console.log("Rendering:", isMobile ? "CharactersMobile" : "Table")
    console.log("Table styles:", {
      maxWidth: isMobile ? "400px" : "100%",
      tableLayout: "fixed",
      columnWidths: {
        name: "remaining",
        created: isMobile ? "65px" : "150px",
        updated: isMobile ? "65px" : "150px",
        active: isMobile ? "60px" : "100px"
      }
    })
  }, [isMobile])

  const fetchCharacters = useCallback(async (page: number = 1, sort: string = "name", order: string = "asc") => {
    try {
      const response = await client.getCharacters({ page, sort, order })
      setCharacters(response.data.characters)
      setMeta(response.data.meta)
    } catch (err) {
      console.error("Fetch characters error:", err)
    }
  }, [client])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = params.get("page") ? parseInt(params.get("page")!, 10) : 1
    const sortParam = params.get("sort")
    const orderParam = params.get("order")
    const currentSort = sortParam && validSorts.includes(sortParam as ValidSort) ? sortParam : "name"
    const currentOrder = orderParam && validOrders.includes(orderParam as ValidOrder) ? orderParam : "asc"
    setSort(currentSort)
    setOrder(currentOrder)
    if (page !== meta.current_page || currentSort !== sort || currentOrder !== order) {
      fetchCharacters(page, currentSort, currentOrder)
    }
  }, [client, meta.current_page, fetchCharacters, order, sort])

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/characters?page=1&sort=${sort}&order=${order}`, { scroll: false })
      fetchCharacters(1, sort, order)
    } else {
      router.push(`/characters?page=${page}&sort=${sort}&order=${order}`, { scroll: false })
      fetchCharacters(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    setSort(newSort)
    setOrder(newOrder)
    router.push(`/characters?page=1&sort=${newSort}&order=${newOrder}`, { scroll: false })
    fetchCharacters(1, newSort, newOrder)
  }

  const handleSortChangeMobile = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      setSort(newSort)
      setOrder("asc")
      router.push(`/characters?page=1&sort=${newSort}&order=asc`, { scroll: false })
      fetchCharacters(1, newSort, "asc")
    }
  }

  const handleOrderChangeMobile = () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/characters?page=1&sort=${sort}&order=${newOrder}`, { scroll: false })
    fetchCharacters(1, sort, newOrder)
  }

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
      <Container maxWidth="md">
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
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
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
              <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                <TableSortLabel
                  active={sort === "updated_at"}
                  direction={sort === "updated_at" ? order as ValidOrder : "asc"}
                  onClick={() => handleSortChange("updated_at")}
                  sx={{
                    color: "#ffffff",
                    "&.Mui-active": { color: "#ffffff" },
                    "& .MuiTableSortLabel-icon": { color: "#ffffff !important" }
                  }}
                >
                  Updated
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
                      {character.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {formatDate(character.created_at || "")}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}>
                    {formatDate(character.updated_at || "")}
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
    </Container>
  )
}
