import { AvatarGroup, Box } from "@mui/material"
import type { ComponentType } from "react"
import { SystemStyleObject, Theme } from "@mui/system"
import { Avatar } from "@/components/avatars"

// Define a generic type for the items and props
interface MembersGroupProps<T> {
  items: T[]
  max?: number
}

export function MembersGroup<T>({
  items,
  AvatarComponent,
  itemPropName = "item", // Default to 'item' if not specified
  max = 5,
}: MembersGroupProps<T>) {
  return (
    <AvatarGroup
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
          +{surplus.toString()[0]}
        </Box>
      )}
    >
      {items.map(item => (
        <Avatar
          entity={item}
          key={item.id} // Assumes each item has an 'id' property; adjust if needed
          sx={{ width: 30, height: 30, fontSize: "0.75rem" }}
        />
      ))}
    </AvatarGroup>
  )
}
