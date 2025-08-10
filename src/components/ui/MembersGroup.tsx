import { Box } from "@mui/material"
import type { ComponentType } from "react"
import { SystemStyleObject, Theme } from "@mui/system"

// Define a generic type for the items and props
interface MembersGroupProps<T> {
  items: T[]
  AvatarComponent: ComponentType<{
    [key: string]: T
    sx?: SystemStyleObject<Theme>
  }> // Component type for the avatar, accepting a prop with dynamic name
  itemPropName?: string // Optional prop name for the avatar component (e.g., 'character')
  max?: number
}

export function MembersGroup<T>({
  items,
  AvatarComponent,
  itemPropName = "item", // Default to 'item' if not specified
  max = 5,
}: MembersGroupProps<T>) {
  return (
    <MembersGroup
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
        <AvatarComponent
          key={item.id} // Assumes each item has an 'id' property; adjust if needed
          {...{ [itemPropName]: item }} // Dynamically set the prop name (e.g., 'character')
          sx={{ width: 30, height: 30, fontSize: "0.75rem" }}
        />
      ))}
    </MembersGroup>
  )
}
