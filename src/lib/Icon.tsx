import React from "react"
import { Box, useTheme } from "@mui/material"
import { FaBolt } from "react-icons/fa"
import { VscGithubAction } from "react-icons/vsc"
import { FaGun } from "react-icons/fa6"
import AutoStoriesIcon from "@mui/icons-material/AutoStories"
import { GiClothes } from "react-icons/gi"
import { GiDramaMasks } from "react-icons/gi"
import { MdFaceRetouchingNatural } from "react-icons/md"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import { FaCarCrash } from "react-icons/fa"
import { GiSwordman } from "react-icons/gi"
import { IoPeopleSharp } from "react-icons/io5"
import { GiSpikyExplosion } from "react-icons/gi"
import { SvgIconProps } from "@mui/material/SvgIcon"
import GroupIcon from "@mui/icons-material/Group"
import FlagIcon from "@mui/icons-material/Flag"
import DescriptionIcon from "@mui/icons-material/Description"
import BuildIcon from "@mui/icons-material/Build"
import { GiCharacter } from "react-icons/gi"

// Define the keyword type
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

// Define category type
type Category = "Combat" | "Characters" | "Affiliations" | "Details" | "Utility"

// Map keywords to categories
const categoryMap: Record<Keyword, Category> = {
  Fights: "Combat",
  Fighters: "Combat",
  Schticks: "Combat",
  "Action Values": "Combat",
  Weapons: "Combat",
  Character: "Characters",
  Characters: "Characters",
  Parties: "Characters",
  Factions: "Affiliations",
  Description: "Details",
  Appearance: "Details",
  "Personal Details": "Details",
  Dress: "Details",
  "Melodramatic Hook": "Details",
  Background: "Details",
  Skills: "Utility",
  Vehicles: "Utility",
}

// Map keywords to JSX icon elements
const iconMap: Record<Keyword, React.ReactElement> = {
  Fights: (
    <Box>
      <GiSpikyExplosion />
    </Box>
  ),
  Fighters: (
    <Box>
      <GiSwordman />
    </Box>
  ),
  Character: (
    <Box>
      <IoPeopleSharp />
    </Box>
  ),
  Characters: (
    <Box>
      <GiCharacter />
    </Box>
  ),
  Parties: <GroupIcon />,
  Factions: <FlagIcon />,
  Schticks: (
    <Box>
      <VscGithubAction />
    </Box>
  ),
  Description: <DescriptionIcon />,
  Appearance: (
    <Box>
      <MdFaceRetouchingNatural />
    </Box>
  ),
  Skills: <BuildIcon />,
  Vehicles: (
    <Box>
      <FaCarCrash />
    </Box>
  ),
  "Personal Details": <AssignmentIndIcon />,
  "Action Values": (
    <Box>
      <FaBolt />
    </Box>
  ),
  Dress: (
    <Box>
      <GiClothes />
    </Box>
  ),
  "Melodramatic Hook": (
    <Box>
      <GiDramaMasks />
    </Box>
  ),
  Background: <AutoStoriesIcon />,
  Weapons: (
    <Box>
      <FaGun />
    </Box>
  ),
}

interface IconProps extends SvgIconProps {
  keyword: Keyword
}

// Reusable Icon component that renders the icon with category-based colors
export const Icon: React.FC<IconProps> = ({ keyword, ...props }) => {
  const theme = useTheme()
  const iconElement = iconMap[keyword]
  if (!iconElement) return null
  const category = categoryMap[keyword]
  const colorMap: Record<Category, { color: string; hoverColor: string }> = {
    Combat: {
      color: theme.palette.error.main,
      hoverColor: theme.palette.error.dark,
    },
    Characters: {
      color: theme.palette.secondary.main,
      hoverColor: theme.palette.secondary.dark,
    },
    Affiliations: {
      color: theme.palette.custom.gold.main,
      hoverColor: theme.palette.custom.gold.light,
    },
    Details: {
      color: theme.palette.custom.purple.main,
      hoverColor: theme.palette.custom.purple.light,
    },
    Utility: {
      color: theme.palette.primary.main,
      hoverColor: theme.palette.primary.dark,
    },
  }
  const { color, hoverColor } = colorMap[category]
  // Clone the icon element to apply category-based colors and additional props
  return React.cloneElement(iconElement, {
    ...props,
    sx: {
      color,
      fontSize: 24, // Default size to match iconMap sizes
      "& .MuiSvgIcon-root": {
        // Target nested SVG icons within Box
        color,
        fontSize: 24,
        "&:hover": {
          color: hoverColor,
        },
      },
      ...props.sx,
    },
  })
}

// Export categoryMap for use in parent components
export { categoryMap }
