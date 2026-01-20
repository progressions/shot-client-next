"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useRouter } from "next/navigation"
import debounce from "lodash.debounce"
import { useClient } from "@/contexts"
import { getUrl } from "@/lib/maps"
import type {
  Character,
  Vehicle,
  Fight,
  Site,
  Party,
  Faction,
  Schtick,
  Weapon,
  Juncture,
  Adventure,
  SearchResponse,
} from "@/types"
import {
  CharacterBadge,
  VehicleBadge,
  FightBadge,
  SiteBadge,
  PartyBadge,
  FactionBadge,
  SchtickBadge,
  WeaponBadge,
  JunctureBadge,
  AdventureBadge,
} from "@/components/badges"

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

// Entity type display labels
const ENTITY_LABELS: Record<string, string> = {
  characters: "Characters",
  vehicles: "Vehicles",
  fights: "Fights",
  sites: "Sites",
  parties: "Parties",
  factions: "Factions",
  schticks: "Schticks",
  weapons: "Weapons",
  junctures: "Junctures",
  adventures: "Adventures",
}

// Order for displaying entity groups
const ENTITY_ORDER = [
  "characters",
  "vehicles",
  "fights",
  "sites",
  "parties",
  "factions",
  "schticks",
  "weapons",
  "junctures",
  "adventures",
]

// Union type for all searchable entities
type SearchableEntity =
  | Character
  | Vehicle
  | Fight
  | Site
  | Party
  | Faction
  | Schtick
  | Weapon
  | Juncture
  | Adventure

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { client } = useClient()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse["results"]>({})
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  // Check if a result's name matches the search query (case-insensitive)
  const isTitleMatch = useCallback(
    (item: SearchableEntity, searchQuery: string): boolean => {
      if (!searchQuery.trim()) return false
      const name = item.name?.toLowerCase() || ""
      return name.includes(searchQuery.toLowerCase())
    },
    []
  )

  // Flatten and sort results: title matches first, then by entity type order
  const flatResults = useMemo(() => {
    const flat: {
      type: string
      item: SearchableEntity
      titleMatch: boolean
    }[] = []
    for (const type of ENTITY_ORDER) {
      const items = results[type as keyof typeof results]
      if (items && items.length > 0) {
        for (const item of items) {
          flat.push({
            type,
            item: item as SearchableEntity,
            titleMatch: isTitleMatch(item as SearchableEntity, query),
          })
        }
      }
    }
    // Sort: title matches first, then by entity type order
    flat.sort((a, b) => {
      // Title matches come first
      if (a.titleMatch && !b.titleMatch) return -1
      if (!a.titleMatch && b.titleMatch) return 1
      // Within same relevance tier, maintain entity type order
      const aTypeIndex = ENTITY_ORDER.indexOf(a.type)
      const bTypeIndex = ENTITY_ORDER.indexOf(b.type)
      return aTypeIndex - bTypeIndex
    })
    return flat
  }, [results, query, isTitleMatch])

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults({})
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await client.search(searchQuery)
        setResults(response.data.results)
        setSelectedIndex(0)
      } catch (error) {
        console.error("Search failed:", error)
        setResults({})
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  // Debounced search using lodash.debounce
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => performSearch(searchQuery), 150),
    [performSearch]
  )

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQuery("")
      setResults({})
      setSelectedIndex(0)
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedIndex])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // Navigate to selected result
  const navigateToResult = useCallback(
    (item: SearchableEntity) => {
      const entityClass =
        "entity_class" in item ? item.entity_class : getEntityClass(item)
      const url = getUrl(entityClass, item.id, item.name)
      router.push(url)
      onClose()
    },
    [router, onClose]
  )

  // Get entity class from item type
  const getEntityClass = (item: SearchableEntity): string => {
    if ("action_values" in item && "description" in item) {
      // Could be Character or Vehicle - check for vehicle-specific fields
      if ("impairments" in item && !("extending" in item)) {
        return "Vehicle"
      }
      return "Character"
    }
    if ("sequence" in item) return "Fight"
    if (
      "attunements" in item ||
      ("faction_id" in item &&
        "character_ids" in item &&
        !("memberships" in item))
    )
      return "Site"
    if ("memberships" in item) return "Party"
    if ("character_ids" in item && !("faction_id" in item)) return "Faction"
    if ("path" in item) return "Schtick"
    if ("damage" in item) return "Weapon"
    if ("faction_id" in item && !("character_ids" in item)) return "Juncture"
    if ("season" in item) return "Adventure"
    return "Character"
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && flatResults.length > 0) {
      e.preventDefault()
      const selected = flatResults[selectedIndex]
      if (selected) {
        navigateToResult(selected.item)
      }
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  // Render a single result item using the appropriate badge component
  const renderResultItem = (
    type: string,
    item: SearchableEntity,
    globalIndex: number
  ) => {
    const isSelected = globalIndex === selectedIndex

    return (
      <Box
        key={item.id}
        ref={isSelected ? selectedItemRef : undefined}
        role="option"
        aria-selected={isSelected}
        onClick={() => navigateToResult(item)}
        sx={{
          p: 0.5,
          cursor: "pointer",
          bgcolor: isSelected ? "rgba(255, 255, 255, 0.1)" : "transparent",
          borderRadius: 1,
          transition: "background-color 0.15s",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        {renderBadgeForType(type, item)}
      </Box>
    )
  }

  // Render the appropriate badge component based on entity type
  const renderBadgeForType = (type: string, item: SearchableEntity) => {
    switch (type) {
      case "characters":
        return <CharacterBadge character={item as Character} size="sm" />
      case "vehicles":
        return <VehicleBadge vehicle={item as Vehicle} size="sm" />
      case "fights":
        return <FightBadge fight={item as Fight} size="sm" />
      case "sites":
        return <SiteBadge site={item as Site} size="sm" />
      case "parties":
        return <PartyBadge party={item as Party} size="sm" />
      case "factions":
        return <FactionBadge faction={item as Faction} size="sm" />
      case "schticks":
        return <SchtickBadge schtick={item as Schtick} size="sm" />
      case "weapons":
        return <WeaponBadge weapon={item as Weapon} size="sm" />
      case "junctures":
        return <JunctureBadge juncture={item as Juncture} size="sm" />
      case "adventures":
        return <AdventureBadge adventure={item as Adventure} size="sm" />
      default:
        return null
    }
  }

  // Render results sorted by relevance (title matches first)
  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )
    }

    if (query && flatResults.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No results found
          </Typography>
        </Box>
      )
    }

    if (!query) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Start typing to search
          </Typography>
        </Box>
      )
    }

    // Group results by title match status, then by entity type
    const titleMatches = flatResults.filter(r => r.titleMatch)
    const otherMatches = flatResults.filter(r => !r.titleMatch)

    // Group items by type within each relevance tier
    const groupByType = (
      items: typeof flatResults
    ): Record<string, typeof flatResults> => {
      const groups: Record<string, typeof flatResults> = {}
      for (const item of items) {
        if (!groups[item.type]) groups[item.type] = []
        groups[item.type].push(item)
      }
      return groups
    }

    const titleMatchGroups = groupByType(titleMatches)
    const otherMatchGroups = groupByType(otherMatches)

    // Calculate global indices for keyboard navigation
    let globalIndex = 0

    const renderSection = (groups: Record<string, typeof flatResults>) => {
      const types = ENTITY_ORDER.filter(type => groups[type]?.length > 0)
      if (types.length === 0) return null

      return (
        <>
          {types.map(type => {
            const items = groups[type]
            const renderedItems = items.map(({ item }) => {
              const result = renderResultItem(type, item, globalIndex)
              globalIndex++
              return result
            })

            return (
              <Box key={type}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#888",
                    display: "block",
                    mb: 1,
                    px: 1,
                  }}
                >
                  {ENTITY_LABELS[type]}
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {renderedItems}
                </Box>
              </Box>
            )
          })}
        </>
      )
    }

    return (
      <Box
        role="listbox"
        aria-label="Search results"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {renderSection(titleMatchGroups)}
        {renderSection(otherMatchGroups)}
      </Box>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="search-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: "#1d1d1d",
          color: "#ffffff",
          borderRadius: 2,
          maxHeight: "70vh",
        },
      }}
    >
      <DialogTitle
        id="search-dialog-title"
        sx={{
          p: 0,
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        Search
      </DialogTitle>
      <DialogContent sx={{ p: 2, pt: 4 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          sx={{ mt: 2 }}
          placeholder="Search characters, sites, factions..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          inputProps={{
            "aria-label": "Search",
            "aria-controls": "search-results",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#888" }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: "#2a2a2a",
              borderRadius: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#333",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#444",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#666",
              },
              "& input": {
                color: "#fff",
              },
              "& input::placeholder": {
                color: "#888",
                opacity: 1,
              },
            },
          }}
        />
        <Box
          id="search-results"
          sx={{
            mt: 2,
            maxHeight: "50vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#1d1d1d",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#444",
              borderRadius: "4px",
            },
          }}
        >
          {renderResults()}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
