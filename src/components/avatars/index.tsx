// Export the generic Avatar component as the default and with specific aliases for backward compatibility
export { default as Avatar } from "./Avatar"
export { default as EntityAvatar } from "./Avatar"

// Re-export the generic Avatar for all entity-specific avatar needs
// These are deprecated - use Avatar or EntityAvatar directly instead
export { default as CharacterAvatar } from "./Avatar"
export { default as CampaignAvatar } from "./Avatar"
export { default as FightAvatar } from "./Avatar"
export { default as VehicleAvatar } from "./Avatar"
export { default as UserAvatar } from "./Avatar"
export { default as SiteAvatar } from "./Avatar"
export { default as FactionAvatar } from "./Avatar"
export { default as JunctureAvatar } from "./Avatar"
export { default as SchtickAvatar } from "./Avatar"
export { default as WeaponAvatar } from "./Avatar"
export { default as PartyAvatar } from "./Avatar"
