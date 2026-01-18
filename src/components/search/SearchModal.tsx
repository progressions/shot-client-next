"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useRouter } from "next/navigation"
import { useClient } from "@/contexts"
import { badgeComponents, badgePropNames, getUrl } from "@/lib/maps"
import type { SearchResultItem, SearchResponse } from "@/types"

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

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { client } = useClient()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse["results"]>({})
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: { type: string; item: SearchResultItem }[] = []
    for (const type of ENTITY_ORDER) {
      const items = results[type as keyof typeof results]
      if (items && items.length > 0) {
        for (const item of items) {
          flat.push({ type, item })
        }
      }
    }
    return flat
  }, [results])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setQuery("")
      setResults({})
      setSelectedIndex(0)
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
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

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 150)
  }

  // Navigate to selected result
  const navigateToResult = useCallback(
    (item: SearchResultItem) => {
      const url = getUrl(item.entity_class, item.id, item.name)
      router.push(url)
      onClose()
    },
    [router, onClose]
  )

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

  // Render a single result item with its badge
  const renderResultItem = (
    item: SearchResultItem,
    index: number,
    globalIndex: number
  ) => {
    const BadgeComponent = badgeComponents[item.entity_class]
    const propName = badgePropNames[item.entity_class]
    const isSelected = globalIndex === selectedIndex

    if (!BadgeComponent || !propName) {
      return null
    }

    // Create the entity prop dynamically
    const entityProp = { [propName]: item }

    return (
      <Box
        key={item.id}
        onClick={() => navigateToResult(item)}
        sx={{
          cursor: "pointer",
          bgcolor: isSelected ? "rgba(255, 255, 255, 0.1)" : "transparent",
          borderRadius: 1,
          transition: "background-color 0.15s",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <BadgeComponent {...entityProp} size="sm" />
      </Box>
    )
  }

  // Render results grouped by entity type
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

    let globalIndex = 0
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ENTITY_ORDER.map(type => {
          const items = results[type as keyof typeof results]
          if (!items || items.length === 0) return null

          const startIndex = globalIndex
          const renderedItems = items.map((item, index) => {
            const result = renderResultItem(item, index, globalIndex)
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {renderedItems}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1d1d1d",
          color: "#ffffff",
          borderRadius: 2,
          maxHeight: "70vh",
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search characters, sites, factions..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
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
