"use client"

import { Stack, Box, IconButton, Pagination } from "@mui/material"
import type { PaginationMeta, Entity } from "@/types"
import { useState } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  AdventureBadge,
  CharacterBadge,
  VehicleBadge,
  PartyBadge,
  FactionBadge,
  FightBadge,
  JunctureBadge,
  SiteBadge,
  WeaponBadge,
  SchtickBadge,
  UserBadge,
  Badge,
} from "@/components/badges"
import type {
  Adventure,
  Character,
  Vehicle,
  Party,
  Faction,
  Fight,
  Juncture,
  Site,
  Weapon,
  Schtick,
  User,
} from "@/types"

type BadgeListProps = {
  items: Entity[]
  open: boolean
  handleDelete: (item: Entity) => void
  collection: string
  meta: PaginationMeta
  handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void
}

const badgeMap: Record<string, (thing: Entity) => React.ReactNode> = {
  adventures: (thing: Entity) => (
    <AdventureBadge adventure={thing as Adventure} />
  ),
  characters: (thing: Entity) => (
    <CharacterBadge character={thing as Character} />
  ),
  villains: (thing: Entity) => (
    <CharacterBadge character={thing as Character} />
  ),
  vehicles: (thing: Entity) => <VehicleBadge vehicle={thing as Vehicle} />,
  parties: (thing: Entity) => <PartyBadge party={thing as Party} />,
  junctures: (thing: Entity) => <JunctureBadge juncture={thing as Juncture} />,
  sites: (thing: Entity) => <SiteBadge site={thing as Site} />,
  weapons: (thing: Entity) => <WeaponBadge weapon={thing as Weapon} />,
  factions: (thing: Entity) => <FactionBadge faction={thing as Faction} />,
  schticks: (thing: Entity) => <SchtickBadge schtick={thing as Schtick} />,
  fights: (thing: Entity) => <FightBadge fight={thing as Fight} />,
  users: (thing: Entity) => <UserBadge user={thing as User} />,
  players: (thing: Entity) => <UserBadge user={thing as User} />,
}

export function BadgeList({
  items,
  open,
  collection,
  meta,
  handlePageChange,
  handleDelete,
}: BadgeListProps) {
  const [saving, setSaving] = useState(false)
  const badge = badgeMap[collection]

  const deleteMember = async (item: Entity) => {
    setSaving(true)
    await handleDelete(item)
    setSaving(false)
  }

  if (!meta) return
  return (
    <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
      {!items.length && (
        <Badge entity={{ name: "No items found" }} disableAvatar={true}>
          No items found
        </Badge>
      )}
      {items.map((item: Entity, index: number) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          key={`${item.id}-${index}`}
        >
          <Box sx={{ width: "100%" }}>{badge(item)}</Box>
          {open && (
            <Box>
              <IconButton
                color="error"
                onClick={() => deleteMember(item)}
                disabled={saving}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
      ))}
      <Pagination
        disabled={saving}
        count={meta.total_pages || 1}
        page={meta.current_page || 1}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        shape="rounded"
        size="medium"
      />
    </Stack>
  )
}
