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
  Avatar,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useRouter } from "next/navigation"
import { useClient } from "@/contexts"
import { getUrl } from "@/lib/maps"
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const selectedItemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

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

    // Cleanup on close or unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = selectedItemRefs.current.get(selectedIndex)
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedIndex])

  // Debounced search with abort controller
  const performSearch = useCallback(
    async (searchQuery: string) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      if (!searchQuery.trim()) {
        setResults({})
        setLoading(false)
        return
      }

      // Create new abort controller for this request
      const controller = new AbortController()
      abortControllerRef.current = controller

      setLoading(true)
      try {
        const response = await client.search(searchQuery)

        // Check if this request was aborted
        if (controller.signal.aborted) {
          return
        }

        setResults(response.data.results)
        setSelectedIndex(0)
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        console.error("Search failed:", error)
        setResults({})
      } finally {
        // Only update loading state if not aborted
        if (!controller.signal.aborted) {
          setLoading(false)
        }
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

  // Render a single result item - simple display for search results
  const renderResultItem = (item: SearchResultItem, globalIndex: number) => {
    const isSelected = globalIndex === selectedIndex

    return (
      <Box
        key={item.id}
        ref={(el: HTMLDivElement | null) => {
          if (el) {
            selectedItemRefs.current.set(globalIndex, el)
          } else {
            selectedItemRefs.current.delete(globalIndex)
          }
        }}
        role="option"
        aria-selected={isSelected}
        onClick={() => navigateToResult(item)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1,
          cursor: "pointer",
          bgcolor: isSelected ? "rgba(255, 255, 255, 0.1)" : "transparent",
          borderRadius: 1,
          transition: "background-color 0.15s",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Avatar
          src={item.image_url || undefined}
          sx={{
            width: 32,
            height: 32,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            fontSize: "0.875rem",
          }}
        >
          {item.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </Typography>
          {item.description && (
            <Typography
              variant="caption"
              sx={{
                color: "#888",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "#666",
            textTransform: "uppercase",
            fontSize: "0.625rem",
            letterSpacing: "0.05em",
          }}
        >
          {item.entity_class}
        </Typography>
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
      <Box
        role="listbox"
        aria-label="Search results"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {ENTITY_ORDER.map(type => {
          const items = results[type as keyof typeof results]
          if (!items || items.length === 0) return null

          const renderedItems = items.map(item => {
            const result = renderResultItem(item, globalIndex)
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
      <DialogContent sx={{ p: 2 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
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
          ref={resultsContainerRef}
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
