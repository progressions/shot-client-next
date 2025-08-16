import { AvatarGroup, Box } from "@mui/material"
import { Avatar } from "@/components/avatars"
import { SystemStyleObject, Theme } from "@mui/system"
import pluralize from "pluralize"

// Define a generic type for the items and props
interface MembersGroupProps<T> {
  items: T[]
  max?: number
  sx?: SystemStyleObject<Theme>
}

export function MembersGroup<T>({ items, max = 5, sx }: MembersGroupProps<T>) {
  return (
    <AvatarGroup
      sx={sx}
      max={max}
      slotProps={{
        surplus: {
          sx: {
            lineHeight: "30px",
            textAlign: "center",
            width: "30px",
            height: "30px",
            fontSize: "0.75rem",
          },
        },
      }}
      renderSurplus={surplus => (
        <Box
          component="span"
          sx={{ width: 30, height: 30, fontSize: "0.75rem" }}
        >
          +{surplus.toString()}
        </Box>
      )}
    >
      {items.map(item => (
        <Avatar
          entity={item}
          href={
            item.id
              ? `/${pluralize(item.entity_class.toLowerCase())}/${item.id}`
              : undefined
          }
          key={item.id} // Assumes each item has an 'id' property; adjust if needed
          sx={{ width: 30, height: 30, fontSize: "0.75rem" }}
        />
      ))}
    </AvatarGroup>
  )
}
