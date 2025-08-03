import React from "react"
import { List, ListItem, ListItemIcon, ListItemText, Box } from "@mui/material"
import { Icon } from "./Icon"

// Define the keyword type (same as in Icon.tsx)
type Keyword =
  | "Fights"
  | "Fighters"
  | "Character"
  | "Characters"
  | "Parties"
  | "Factions"
  | "Schticks"
  | "Description"
  | "Appearance"
  | "Skills"
  | "Vehicles"
  | "Personal Details"
  | "Action Values"
  | "Dress"
  | "Melodramatic Hook"
  | "Background"
  | "Weapons"

// List of all keywords for display
const keywords: Keyword[] = [
  "Fights",
  "Fighters",
  "Character",
  "Characters",
  "Parties",
  "Factions",
  "Schticks",
  "Description",
  "Appearance",
  "Skills",
  "Vehicles",
  "Personal Details",
  "Action Values",
  "Dress",
  "Melodramatic Hook",
  "Background",
  "Weapons",
]

interface ConceptSelectorProps {
  selectedKeyword: Keyword | null
  onSelect: (keyword: Keyword) => void
}

export const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  selectedKeyword,
  onSelect,
}) => {
  return (
    <Box
      sx={{
        maxWidth: 300,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <List>
        {keywords.map(keyword => (
          <ListItem
            key={keyword}
            button
            selected={selectedKeyword === keyword}
            onClick={() => onSelect(keyword)}
            sx={{
              "&:hover": { bgcolor: "action.hover" },
              "&.Mui-selected": { bgcolor: "action.selected" },
            }}
          >
            <ListItemIcon>
              <Icon keyword={keyword} />
            </ListItemIcon>
            <ListItemText primary={keyword} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
