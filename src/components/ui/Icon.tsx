import React from "react"
import pluralize from "pluralize"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import { Box } from "@mui/material"
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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import { iconColorMap, type Category } from "@/components/ui/iconColors"

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
  | "Add Character"
  | "Add Vehicle"
  | "Administration"

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
  "Add Character": "Utility",
  "Add Vehicle": "Utility",
  Administration: "Interface",
}

// Map keywords to JSX icon elements
const iconMap: Record<Keyword, React.ReactElement> = {
  Juncture: <IoIosClock />,
  Site: <GiMagicGate />,
  "Feng Shui Site": (
    <Box component="span">
      <GiMagicGate />
    </Box>
  ),
  Fight: <GiSpikyExplosion />,
  Fighter: <GiSwordman />,
  Character: <IoPeopleSharp />,
  Party: <GroupIcon />,
  Faction: <FlagIcon />,
  Schtick: <VscGithubAction />,
  Description: <DescriptionIcon />,
  Appearance: <MdFaceRetouchingNatural />,
  Skill: <BuildIcon />,
  Vehicle: <FaCarCrash />,
  "Personal Detail": <AssignmentIndIcon />,
  "Action Value": <FaBolt />,
  Dress: <GiClothes />,
  "Melodramatic Hook": <GiDramaMasks />,
  Background: <AutoStoriesIcon />,
  Weapon: <FaGun />,
  Action: <BoltIcon sx={{ fontSize: 36 }} />,
  "Add Character": (
    <Box component="span">
      <PersonAddIcon />
    </Box>
  ),
  "Add Vehicle": (
    <Box component="span">
      <DirectionsCarIcon />
    </Box>
  ),
  Administration: <AdminPanelSettingsIcon />,
}

interface IconProps extends SvgIconProps {
  keyword: Keyword
  size?: number
  color?: string
  hoverColor?: string
}

// Reusable Icon component that renders the icon with category-based colors
export const Icon: React.FC<IconProps> = ({
  size,
  keyword,
  color,
  hoverColor,
  ...props
}) => {
  const singularKeyword = pluralize.singular(keyword) as Keyword
  const iconElement = iconMap[singularKeyword]
  if (!iconElement) return null
  const category = categoryMap[singularKeyword]

  const { color: defaultColor, hoverColor: defaultHoverColor } =
    iconColorMap[category]

  try {
    return React.cloneElement(iconElement, {
      ...props,
      size: size || 24,
      color: color || defaultColor,
      sx: {
        color: color || defaultColor,
        fontSize: size || 24,
        height: size || 24,
        width: size || 24,
        "& .MuiSvgIcon-root": {
          color: color || defaultColor,
          fontSize: size || 24,
          "&:hover": {
            color: hoverColor || defaultHoverColor,
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
