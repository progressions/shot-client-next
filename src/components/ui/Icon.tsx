import React from "react"
import pluralize from "pluralize"
import { Box, useTheme } from "@mui/material"
import { IoIosClock } from "react-icons/io"
import { GiMagicGate } from "react-icons/gi"
import BoltIcon from "@mui/icons-material/Bolt"
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
  | "Fight"
  | "Fighter"
  | "Character"
  | "Party"
  | "Faction"
  | "Schtick"
  | "Site"
  | "Feng Shui Site"
  | "Description"
  | "Appearance"
  | "Skill"
  | "Vehicle"
  | "Personal Detail"
  | "Action Value"
  | "Dress"
  | "Melodramatic Hook"
  | "Background"
  | "Weapon"
  | "Action"
  | "Juncture"

// Define category type
type Category =
  | "Combat"
  | "Characters"
  | "Affiliations"
  | "Details"
  | "Utility"
  | "Interface"

// Map keywords to categories
const categoryMap: Record<Keyword, Category> = {
  Fight: "Combat",
  Fighter: "Combat",
  Schtick: "Combat",
  "Action Value": "Combat",
  Weapon: "Combat",
  Site: "Affiliations",
  "Feng Shui Site": "Affiliations",
  Character: "Characters",
  Party: "Affiliations",
  Faction: "Affiliations",
  Juncture: "Affiliations",
  Description: "Details",
  Appearance: "Details",
  "Personal Detail": "Details",
  Dress: "Details",
  "Melodramatic Hook": "Details",
  Background: "Details",
  Skill: "Utility",
  Vehicle: "Utility",
  Action: "Interface",
}

// Map keywords to JSX icon elements
const iconMap: Record<Keyword, React.ReactElement> = {
  Juncture: (
    <Box component="span">
      <IoIosClock />
    </Box>
  ),
  Site: (
    <Box component="span">
      <GiMagicGate />
    </Box>
  ),
  "Feng Shui Site": (
    <Box component="span">
      <GiMagicGate />
    </Box>
  ),
  Fight: (
    <Box component="span">
      <GiSpikyExplosion />
    </Box>
  ),
  Fighter: (
    <Box component="span">
      <GiSwordman />
    </Box>
  ),
  Character: (
    <Box component="span">
      <IoPeopleSharp />
    </Box>
  ),
  Party: <GroupIcon />,
  Faction: <FlagIcon />,
  Schtick: (
    <Box component="span">
      <VscGithubAction />
    </Box>
  ),
  Description: <DescriptionIcon />,
  Appearance: (
    <Box component="span">
      <MdFaceRetouchingNatural />
    </Box>
  ),
  Skill: <BuildIcon />,
  Vehicle: (
    <Box component="span">
      <FaCarCrash />
    </Box>
  ),
  "Personal Detail": <AssignmentIndIcon />,
  "Action Value": (
    <Box component="span">
      <FaBolt />
    </Box>
  ),
  Dress: (
    <Box component="span">
      <GiClothes />
    </Box>
  ),
  "Melodramatic Hook": (
    <Box component="span">
      <GiDramaMasks />
    </Box>
  ),
  Background: <AutoStoriesIcon />,
  Weapon: (
    <Box component="span">
      <FaGun />
    </Box>
  ),
  Action: (
    <Box component="span">
      <BoltIcon sx={{ fontSize: 36, "& .MuiSvgIcon-root": { fontSize: 36 } }} />
    </Box>
  ),
}

interface IconProps extends SvgIconProps {
  keyword: Keyword
  size?: number
}

// Reusable Icon component that renders the icon with category-based colors
export const Icon: React.FC<IconProps> = ({ size, keyword, ...props }) => {
  const theme = useTheme()
  const singularKeyword = pluralize.singular(keyword) as Keyword
  const iconElement = iconMap[singularKeyword]
  if (!iconElement) return null
  const category = categoryMap[singularKeyword]
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
    Interface: {
      color: theme.palette.primary.main,
      hoverColor: theme.palette.primary.dark,
    },
  }
  try {
    const { color, hoverColor } = colorMap[category]
    // Clone the icon element to apply category-based colors and additional props
    return React.cloneElement(iconElement, {
      ...props,
      sx: {
        color,
        fontSize: size ? size : 24, // Default size is 24 if not provided
        "& .MuiSvgIcon-root": {
          // Target nested SVG icons within Box
          color,
          fontSize: size ? size : 24,
          "&:hover": {
            color: hoverColor,
          },
        },
        ...props.sx,
      },
    })
  } catch (error) {
    console.error("Error rendering icon:", error)
    return null
  }
}

// Export categoryMap for use in parent components
export { categoryMap }
