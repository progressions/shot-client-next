import React from "react"
import { SystemStyleObject, Theme } from "@mui/system"
import { IconButtonProps } from "@mui/material"
import { EditorChangeEvent } from "@tiptap/react"
import { Entity, AutocompleteOption } from "./types"

/**
 * Common base prop types used across components
 */
export interface BaseProps {
  children?: React.ReactNode
  sx?: SystemStyleObject<Theme>
}

export interface BaseInputProps {
  name: string
  value: string | number | boolean | null
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: boolean
  disabled?: boolean
}

/**
 * Generic component prop types
 */
export interface ChipsetProps extends BaseProps {
  children: React.ReactNode
}

export interface HeroTitleProps extends BaseProps {
  children: React.ReactNode
}

export interface AvatarProps {
  entity: Entity
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

export interface BadgeProps extends BaseProps {
  name?: string
  entity: Entity
  size?: "sm" | "md" | "lg"
  title: React.ReactNode
  children: React.ReactNode
  disableAvatar?: boolean
}

/**
 * Resource-specific badge component props
 */
export interface SiteBadgeProps {
  site: import("./resources").Site
  size?: "sm" | "md" | "lg"
}

export interface FactionBadgeProps {
  faction: import("./resources").Faction
  size?: "sm" | "md" | "lg"
}

export interface WeaponBadgeProps {
  weapon: import("./resources").Weapon
  size?: "sm" | "md" | "lg"
}

export interface JunctureBadgeProps {
  juncture: import("./resources").Juncture
  size?: "sm" | "md" | "lg"
}

export interface FightBadgeProps {
  fight: import("./resources").Fight
  size?: "sm" | "md" | "lg"
}

export interface PartyBadgeProps {
  party: import("./resources").Party
  size?: "sm" | "md" | "lg"
}

export interface CampaignBadgeProps {
  campaign: import("./resources").Campaign
  size?: "sm" | "md" | "lg"
}

export interface VehicleBadgeProps {
  vehicle: import("./resources").Vehicle
  size?: "sm" | "md" | "lg"
}

export interface CharacterBadgeProps {
  character: import("./resources").Character
  size?: "sm" | "md" | "lg"
}

export interface UserBadgeProps {
  user: import("./resources").User
  size?: "sm" | "md" | "lg"
}

export interface SchtickBadgeProps {
  schtick: import("./resources").Schtick
  size?: "sm" | "md" | "lg"
}

/**
 * Form and input component props
 */
export interface NumberFieldProps extends BaseProps {
  name: string
  value: number | null
  size: "small" | "large"
  width: string
  error: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
}

export interface EditableRichTextProps {
  name: string
  html: string
  editable?: boolean
  onChange?: (event: EditorChangeEvent) => void
  fallback?: string
}

/**
 * UI component props
 */
export interface DeleteButtonProps extends IconButtonProps {
  tooltipTitle?: string
}

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: React.ReactNode
}

export interface MembersGroupProps<T> extends BaseProps {
  items: T[]
  max?: number
}

/**
 * Filter and search component props
 */
export interface GenericFilterProps {
  entity: keyof typeof import("../lib/filterConfigs").default
  formState: {
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }
  onChange?: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string | boolean | null>) => void
  omit?: string[]
  excludeIds?: number[]
}

/**
 * Navigation component props
 */
export interface BreadcrumbItem {
  label: string | React.ReactNode
  path: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/**
 * Action value component props
 */
export interface AVProps {
  label: string
  value: number | string
  maxValue?: number
}

/**
 * Generic props for table and list components
 */
export interface TableViewProps<T> {
  formState: import("../reducers").FormStateType<T>
  dispatchForm: (action: import("../reducers").FormStateAction<T>) => void
}

/**
 * Resource-specific prop types for autocomplete and selection
 */
export interface ResourceSelectorProps<T = Entity> {
  value?: T | null
  onChange?: (value: T | null) => void
  disabled?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
}

/**
 * Modal and drawer props
 */
export interface ModalProps extends BaseProps {
  open: boolean
  onClose: () => void
  title?: string
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"
}

export interface DrawerProps extends BaseProps {
  open: boolean
  onClose: () => void
  anchor?: "left" | "right" | "top" | "bottom"
  title?: string
}

/**
 * Resource-specific Table and View component props
 * Standardized naming for ViewProps used across different components
 */
export interface FightTableProps {
  formState: import("./state").FormStateType<
    import("./forms").FightsTableFormState
  >
  dispatchForm: (
    action: import("./state").FormStateAction<
      import("./forms").FightsTableFormState
    >
  ) => void
}

export interface FightViewProps {
  formState: import("./state").FormStateType<import("./resources").Fight>
  dispatchForm: (
    action: import("./state").FormStateAction<import("./resources").Fight>
  ) => void
}

export interface UserTableProps {
  formState: import("./state").FormStateType<
    import("./forms").UsersTableFormState
  >
  dispatchForm: (
    action: import("./state").FormStateAction<
      import("./forms").UsersTableFormState
    >
  ) => void
}

export interface UserViewProps {
  formState: import("./state").FormStateType<import("./resources").User>
  dispatchForm: (
    action: import("./state").FormStateAction<import("./resources").User>
  ) => void
}

export interface PartyTableProps {
  formState: import("./state").FormStateType<
    import("./forms").PartiesTableFormState
  >
  dispatchForm: (
    action: import("./state").FormStateAction<
      import("./forms").PartiesTableFormState
    >
  ) => void
}

export interface CharacterTableProps {
  formState: import("./state").FormStateType<
    import("./forms").CharactersTableFormState
  >
  dispatchForm: (
    action: import("./state").FormStateAction<
      import("./forms").CharactersTableFormState
    >
  ) => void
}

/**
 * Menu component props for different resources
 */
export interface FightMenuProps {
  fight: import("./resources").Fight
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}

export interface UserMenuProps {
  user: import("./resources").User
  onEdit?: () => void
  onDelete?: () => void
}

export interface PartyMenuProps {
  party: import("./resources").Party
  onEdit?: () => void
  onDelete?: () => void
}

export interface WeaponMenuProps {
  weapon: import("./resources").Weapon
  onEdit?: () => void
  onDelete?: () => void
}

/**
 * Link component props
 * Standardized naming for link components (converting from *Properties to *Props)
 */
export interface FightLinkProps {
  fight: import("./resources").Fight
  children?: React.ReactNode
}

export interface CharacterLinkProps {
  character: import("./resources").Character
  children?: React.ReactNode
}

export interface JunctureLinkProps {
  juncture: import("./resources").Juncture
  children?: React.ReactNode
}

export interface CampaignLinkProps {
  campaign: import("./resources").Campaign
  children?: React.ReactNode
}

export interface WeaponLinkProps {
  weapon: import("./resources").Weapon
  children?: React.ReactNode
}

export interface PartyLinkProps {
  party: import("./resources").Party
  children?: React.ReactNode
}

export interface UserLinkProps {
  user: import("./resources").User
  children?: React.ReactNode
}

/**
 * Form component props
 * Common form patterns across different resources
 */
export interface ProfileFormProps {
  user: import("./resources").User
  onSubmit: (data: Partial<import("./resources").User>) => void
  onCancel?: () => void
  isLoading?: boolean
}

export interface FightFormProps {
  fight?: import("./resources").Fight
  onSubmit: (data: Partial<import("./resources").Fight>) => void
  onCancel?: () => void
  isLoading?: boolean
}

export interface PartyFormProps {
  party?: import("./resources").Party
  onSubmit: (data: Partial<import("./resources").Party>) => void
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * UI utility component props
 */
export interface IconProps {
  keyword: string
  size?: number
  color?: string
  hoverColor?: string
}

export interface CarouselProps extends BaseProps {
  children: React.ReactNode
  autoPlay?: boolean
  interval?: number
}

export interface SearchInputProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

export interface AddButtonProps extends BaseProps {
  onClick: () => void
  label?: string
  variant?: "contained" | "outlined" | "text"
}

export interface MiniButtonProps extends BaseProps {
  onClick: () => void
  children: React.ReactNode
  variant?: "contained" | "outlined" | "text"
  size?: "small" | "medium" | "large"
}
