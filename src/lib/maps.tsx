import {
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

export function getUrl(className: string, id: string) {
  const urlMap: { [key: string]: string } = {
    Adventure: `/adventures/${id}`,
    Fight: `/fights/${id}`,
    Character: `/characters/${id}`,
    Vehicle: `/vehicles/${id}`,
    Schtick: `/schticks/${id}`,
    Weapon: `/weapons/${id}`,
    Site: `/sites/${id}`,
    Party: `/parties/${id}`,
    Faction: `/factions/${id}`,
    Juncture: `/junctures/${id}`,
    User: `/users/${id}`,
    Campaign: `/campaigns/${id}`,
  }
  return urlMap[className] || "#"
}
// Map entity_class to Popup components
export const popupComponents: Record<
  string,
  React.ComponentType<{ id: string }>
> = {
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
