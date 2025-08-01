"use client"

import {
  useMediaQuery,
  Stack,
  Box,
  Typography,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import type { SelectChangeEvent } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CharacterDetail, CharacterFilter } from "@/components/characters"
import { useState } from "react"
import { queryParams } from "@/lib"
import { FormActions } from "@/reducers"
import { useToast } from "@/contexts"

type CharactersMobileProps = {
  formState
  onPageChange: (_event: React.ChangeEvent<unknown>, page: number) => void
  onSortChange: (event: SelectChangeEvent<string>) => void
}

export default function CharactersMobile({
  formState,
  dispatchForm,
  onPageChange,
}: CharactersMobileProps) {
  const { toastSuccess, toastError } = useToast()
  const theme = useTheme()
  const {
    characters,
    meta,
    sort,
    order,
    character_type,
    archetype,
    faction_id,
  } = formState.data

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [showFilter, setShowFilter] = useState(false)

  const handleToggleFilter = () => {
    setShowFilter(!showFilter)
  }

  const handleSortChangeMobile = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
      dispatchForm({ type: FormActions.UPDATE, name: "order", value: "asc" })
      const url = `/characters?${queryParams({
        page,
        sort: newSort,
        order: "asc",
        type: character_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchCharacters(1, newSort, "asc")
    }
  }

  const handleOrderChangeMobile = () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/characters?${queryParams({
      page,
      sort: newSort,
      order: newOrder,
      type: character_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchCharacters(1, sort, newOrder)
  }

  const handleDelete = async (characterId: string) => {
    toastSuccess("Character deleted successfully")
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-label" sx={{ color: "#ffffff" }}>
              Sort By
            </InputLabel>
            <Select
              labelId="sort-label"
              value={sort}
              label="Sort By"
              onChange={handleSortChangeMobile}
              sx={{
                color: "#ffffff",
                "& .MuiSvgIcon-root": { color: "#ffffff" },
              }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="created_at">Created</MenuItem>
              <MenuItem value="updated_at">Updated</MenuItem>
            </Select>
          </FormControl>
          <Typography
            onClick={handleOrderChangeMobile}
            sx={{
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.875rem",
              textDecoration: "underline",
            }}
          >
            {order === "asc" ? "↑ Asc" : "↓ Desc"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleToggleFilter}
          sx={{ height: "fit-content" }}
          endIcon={showFilter ? <ArrowDropUp /> : <ArrowDropDown />}
        >
          Filter
        </Button>
      </Box>
      {showFilter && (
        <CharacterFilter dispatch={dispatchForm} includeCharacters={false} />
      )}
      {characters.length === 0 && (
        <Typography sx={{ color: "#ffffff" }}>
          No characters available
        </Typography>
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
      {characters.map(character => (
        <CharacterDetail
          character={character}
          key={character.id}
          onDelete={handleDelete}
        />
      ))}
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
