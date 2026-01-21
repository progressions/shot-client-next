"use client"

import { useEffect, useMemo, useState } from "react"
import { Box, Stack, Typography, Chip, CircularProgress } from "@mui/material"
import EntityLink from "@/components/ui/links/EntityLink"
import type { Backlink, Entity } from "@/types"

type BacklinksPanelProps = {
  entityId: string
  entityType: string
  fetchBacklinks: (entityType: string, id: string) => Promise<Backlink[]>
}

export function BacklinksPanel({
  entityId,
  entityType,
  fetchBacklinks,
}: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await fetchBacklinks(entityType, entityId)
        if (mounted) setBacklinks(data)
      } catch (err) {
        console.error("Failed to load backlinks", err)
        if (mounted) setBacklinks([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [entityId, entityType, fetchBacklinks])

  const items = useMemo(() => backlinks.slice(0, 12), [backlinks])

  return (
    <Box
      sx={theme => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        p: 2,
        background: theme.palette.background.paper,
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Typography variant="h6" component="div">
          Backlinks
        </Typography>
        <Chip label={items.length} size="small" />
      </Stack>

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2">Loading backlinks…</Typography>
        </Stack>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No backlinks yet.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {items.map(item => {
            const entity: Entity = {
              id: item.id,
              entity_class: item.entity_class,
            } as Entity
            return (
              <Stack
                key={`${item.entity_class}-${item.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Chip
                  label={item.entity_class}
                  size="small"
                  variant="outlined"
                />
                <EntityLink entity={entity}>{item.name}</EntityLink>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

export default BacklinksPanel
