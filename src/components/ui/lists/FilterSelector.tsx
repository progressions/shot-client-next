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
  handleAutocompleteChange,
  collectionIds,
  collectionName,
}) {
  const autocompleteMap: Record<string, React.ReactNode> = {
    actors: <CharacterFilter setEntity={handleAutocompleteChange} />,
    characters: <CharacterFilter setEntity={handleAutocompleteChange} />,
    vehicles: (
      <VehicleAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    parties: (
      <PartyAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    junctures: (
      <JunctureAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    sites: (
      <SiteAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    weapons: <WeaponFilter setEntity={handleAutocompleteChange} />,
    factions: (
      <FactionAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    schticks: (
      <SchtickFilter
        setEntity={handleAutocompleteChange}
        exclude={collectionIds}
      />
    ),
    players: (
      <UserAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    users: (
      <UserAutocomplete
        value={selectedChild?.id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
  }

  const autocomplete = autocompleteMap[collectionName]

  return autocomplete
}
