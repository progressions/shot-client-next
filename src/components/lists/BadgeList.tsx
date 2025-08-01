import { Stack, Box, IconButton, Pagination } from "@mui/material"
import type { PaginationMeta, Entity } from "@/types"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  CharacterBadge,
  VehicleBadge,
  PartyBadge,
  FactionBadge,
  JunctureBadge,
  SiteBadge,
  WeaponBadge,
  SchtickBadge,
  UserBadge,
  Badge,
} from "@/components/badges"

type BadgeListProps = {
  items: Entity[]
  open: boolean
  handleDelete: (item: Entity) => void
  collection: string
  meta: PaginationMeta
  handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void
}

const badgeMap: Record<string, (thing: Entity) => React.ReactNode> = {
  actors: (thing: Entity) => <CharacterBadge character={thing as Character} />,
  characters: (thing: Entity) => (
    <CharacterBadge character={thing as Character} />
  ),
  vehicles: (thing: Entity) => <VehicleBadge vehicle={thing as Vehicle} />,
  parties: (thing: Entity) => <PartyBadge party={thing as Party} />,
  junctures: (thing: Entity) => <JunctureBadge juncture={thing as Juncture} />,
  sites: (thing: Entity) => <SiteBadge site={thing as Site} />,
  weapons: (thing: Entity) => <WeaponBadge weapon={thing as Weapon} />,
  factions: (thing: Entity) => <FactionBadge faction={thing as Faction} />,
  schticks: (thing: Entity) => <SchtickBadge schtick={thing as Schtick} />,
  users: (thing: Entity) => <UserBadge user={thing as User} />,
  players: (thing: Entity) => <UserBadge user={thing as User} />,
}

export default function BadgeList({
  items,
  open,
  collection,
  meta,
  handlePageChange,
  handleDelete,
}: BadgeListProps) {
  const badge = badgeMap[collection]

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
                color="inherit"
                onClick={() => handleDelete(item)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
      ))}
      <Pagination
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
