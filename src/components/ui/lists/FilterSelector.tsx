import { SchtickFilter } from "@/components/schticks"
import { WeaponFilter } from "@/components/weapons"
import { CharacterFilter } from "@/components/characters"
import {
  UserAutocomplete,
  VehicleAutocomplete,
  PartyAutocomplete,
  JunctureAutocomplete,
  SiteAutocomplete,
  FactionAutocomplete,
} from "@/components/autocomplete"

export function FilterSelector({
  selectedChild,
  setSelectedChild,
  handleAddMember,
  collectionIds,
  collectionName,
}) {
  const autocompleteMap: Record<string, React.ReactNode> = {
    characters: (
      <CharacterFilter
        value={selectedChild?.id || ""}
        exclude={collectionIds}
        setSelectedChild={setSelectedChild}
        addMember={handleAddMember}
      />
    ),
    vehicles: (
      <VehicleAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    parties: (
      <PartyAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    junctures: (
      <JunctureAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    sites: (
      <SiteAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    weapons: <WeaponFilter setEntity={setSelectedChild} />,
    factions: (
      <FactionAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    schticks: (
      <SchtickFilter setEntity={setSelectedChild} exclude={collectionIds} />
    ),
    players: (
      <UserAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    users: (
      <UserAutocomplete
        value={selectedChild?.id || ""}
        onChange={setSelectedChild}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
  }

  const autocomplete = autocompleteMap[collectionName]

  return autocomplete
}
