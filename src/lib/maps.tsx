import {
  AdventurePopup,
  CharacterPopup,
  FightPopup,
  VehiclePopup,
  SchtickPopup,
  WeaponPopup,
  SitePopup,
  PartyPopup,
  FactionPopup,
  JuncturePopup,
  UserPopup,
  CampaignPopup,
} from "@/components/popups"
import {
  CharacterName,
  FightName,
  VehicleName,
  SchtickName,
  WeaponName,
  SiteName,
  PartyName,
  FactionName,
  JunctureName,
  UserName,
  CampaignName,
} from "@/components/names"
import {
  AdventureBadge,
  CharacterBadge,
  FightBadge,
  VehicleBadge,
  SchtickBadge,
  WeaponBadge,
  SiteBadge,
  PartyBadge,
  FactionBadge,
  JunctureBadge,
  UserBadge,
  CampaignBadge,
} from "@/components/badges"
import { buildSluggedId } from "@/lib/slug"

export function getUrl(className: string, id: string, name?: string) {
  const urlMap: { [key: string]: string } = {
    Adventure: `/adventures/${buildSluggedId(name, id)}`,
    Fight: `/fights/${buildSluggedId(name, id)}`,
    Character: `/characters/${buildSluggedId(name, id)}`,
    Vehicle: `/vehicles/${buildSluggedId(name, id)}`,
    Schtick: `/schticks/${buildSluggedId(name, id)}`,
    Weapon: `/weapons/${buildSluggedId(name, id)}`,
    Site: `/sites/${buildSluggedId(name, id)}`,
    Party: `/parties/${buildSluggedId(name, id)}`,
    Faction: `/factions/${buildSluggedId(name, id)}`,
    Juncture: `/junctures/${buildSluggedId(name, id)}`,
    User: `/users/${buildSluggedId(name, id)}`,
    Campaign: `/campaigns/${buildSluggedId(name, id)}`,
  }
  return urlMap[className] || "#"
}
// Map entity_class to Popup components
export const popupComponents: Record<
  string,
  React.ComponentType<{ id: string }>
> = {
  Adventure: AdventurePopup,
  Fight: FightPopup,
  Character: CharacterPopup,
  Vehicle: VehiclePopup,
  Schtick: SchtickPopup,
  Weapon: WeaponPopup,
  Site: SitePopup,
  Party: PartyPopup,
  Faction: FactionPopup,
  Juncture: JuncturePopup,
  User: UserPopup,
  Campaign: CampaignPopup,
}

// Map entity_class to Name components
export const nameComponents: Record<string, React.ComponentType<unknown>> = {
  Fight: FightName,
  Character: CharacterName,
  Vehicle: VehicleName,
  Schtick: SchtickName,
  Weapon: WeaponName,
  Site: SiteName,
  Party: PartyName,
  Faction: FactionName,
  Juncture: JunctureName,
  User: UserName,
  Campaign: CampaignName,
}

// Map entity_class to the prop name expected by the Name component
export const namePropNames: Record<string, string> = {
  Adventure: "adventure",
  Fight: "fight",
  Character: "character",
  Vehicle: "vehicle",
  Schtick: "schtick",
  Weapon: "weapon",
  Site: "site",
  Party: "party",
  Faction: "faction",
  Juncture: "juncture",
  User: "user",
  Campaign: "campaign",
}

export const collectionNames: Record<string, string> = {
  Adventure: "adventures",
  Fight: "fights",
  Character: "characters",
  Vehicle: "vehicles",
  Schtick: "schticks",
  Weapon: "weapons",
  Site: "sites",
  Party: "parties",
  Faction: "factions",
  Juncture: "junctures",
  User: "users",
  Campaign: "campaigns",
}

// Map entity_class to Badge components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const badgeComponents: Record<string, React.ComponentType<any>> = {
  Adventure: AdventureBadge,
  Fight: FightBadge,
  Character: CharacterBadge,
  Vehicle: VehicleBadge,
  Schtick: SchtickBadge,
  Weapon: WeaponBadge,
  Site: SiteBadge,
  Party: PartyBadge,
  Faction: FactionBadge,
  Juncture: JunctureBadge,
  User: UserBadge,
  Campaign: CampaignBadge,
}

// Map entity_class to the prop name expected by the Badge component
export const badgePropNames: Record<string, string> = {
  Adventure: "adventure",
  Fight: "fight",
  Character: "character",
  Vehicle: "vehicle",
  Schtick: "schtick",
  Weapon: "weapon",
  Site: "site",
  Party: "party",
  Faction: "faction",
  Juncture: "juncture",
  User: "user",
  Campaign: "campaign",
}
