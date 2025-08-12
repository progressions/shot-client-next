Building a Reusable Autocomplete Component and Filter in React with MUI
In this blog post, we’ll walk through the development of a reusable ModelAutocomplete component and a CharacterFilter component for a React application using Material-UI (MUI), TypeScript, and a Ruby on Rails backend. These components were designed to filter and select characters, factions, and archetypes in a flexible, user-friendly way. We’ll cover the incremental development of each feature, the design choices made, and the decisions that shaped the final implementation.
Project Context
The application manages 11 models (e.g., Character, Faction, Fight, Site), each with an API endpoint (e.g., client.getCharacters) returning data in a consistent format: { data: { [model_name]: { id: number, name: string }[] } }. The goal was to create reusable autocomplete components for each model and a filter component (CharacterFilter) to select a character based on type, faction, and archetype, with options to update an external list and add selected characters via a button.
The development followed a user’s requirements, implemented incrementally to address specific needs while maintaining TypeScript safety, MUI styling, and a clean codebase adhering to preferences: double quotes, no semicolons, no any types, and minimal complexity.
Incremental Development
1. Creating a Generic ModelAutocomplete Component
Feature: A reusable ModelAutocomplete component to fetch and display options for any model (e.g., Character, Faction).
Implementation:

Created a generic component with TypeScript’s generics (<T extends AutocompleteOption>), where AutocompleteOption is { id: number, name: string }.
Defined props: fetchOptions (API call), getOptionLabel (display text), label (input label), value/onChange (selection state), and sx (MUI styling).
Used MUI’s Autocomplete and TextField for rendering, with a loading state to handle async fetches.
Implemented useEffect to fetch options or use records if provided.

Code:
interface AutocompleteOption {
  id: number
  name: string
}

interface ModelAutocompleteProps<T> {
  fetchOptions?: () => Promise<T[]>
  getOptionLabel: (option: T) => string
  label: string
  value: T | null
  onChange: (value: T | null) => void
  records?: T[]
  sx?: SxProps<Theme>
}

export function ModelAutocomplete<T extends AutocompleteOption>({
  fetchOptions,
  getOptionLabel,
  label,
  value,
  onChange,
  records,
  sx
}: ModelAutocompleteProps<T>) {
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (records) {
      setOptions(records)
      return
    }
    if (fetchOptions) {
      setLoading(true)
      fetchOptions()
        .then((data) => setOptions(data))
        .catch((error) => console.error("Failed to fetch options:", error))
        .finally(() => setLoading(false))
    }
  }, [fetchOptions, records])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      loading={loading}
      sx={sx}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  )
}

Choices and Decisions:

Generics: Used TypeScript generics to make ModelAutocomplete reusable across models, constrained by AutocompleteOption for type safety.
MUI Integration: Chose MUI’s Autocomplete for its robust features (e.g., keyboard navigation, accessibility) and consistency with the user’s Material-UI preference.
Optional records: Added records prop to bypass fetching when data is provided externally, supporting use cases like CharacterFilter sharing data.
Simplicity: Avoided complex features (e.g., debouncing) initially to focus on core functionality, as per the user’s preference for minimal complexity.

2. Model-Specific Wrappers (CharacterAutocomplete, FactionAutocomplete)
Feature: Model-specific autocomplete components (e.g., CharacterAutocomplete, FactionAutocomplete) to configure ModelAutocomplete.
Implementation:

Created thin wrappers for each model, passing model-specific fetchOptions (e.g., client.getCharacters), getOptionLabel, and label.
Ensured each component supports records and filters for dynamic data.

Code Example (CharacterAutocomplete):
interface CharacterAutocompleteProps {
  value: AutocompleteOption | null
  onChange: (value: AutocompleteOption | null) => void
  filters: Record<string, string>
  records?: AutocompleteOption[]
  sx?: SxProps<Theme>
}

export function CharacterAutocomplete({ value, onChange, filters, records, sx }: CharacterAutocompleteProps) {
  const { client } = useClient()
  const fetchCharacters = async () => {
    const response = await client.getCharacters({ autocomplete: true, per_page: 200, ...filters })
    return response.data.characters
  }
  return (
    <ModelAutocomplete
      fetchOptions={records ? undefined : fetchCharacters}
      getOptionLabel={(option) => option.name}
      label="Select Character"
      value={value}
      onChange={onChange}
      records={records}
      sx={sx}
    />
  )
}

Choices and Decisions:

Thin Wrappers: Kept wrappers minimal to reduce duplication, relying on ModelAutocomplete for core logic.
Consistent API: Assumed a uniform API pattern (client.getModelName returns { data: { model_names: { id: number, name: string }[] } }) to simplify wrappers.
Filters: Used Record<string, string> for flexibility, as specific filter shapes varied (e.g., faction_id, type).

3. Creating CharacterFilter with Shared Data
Feature: A CharacterFilter component to filter characters by type and faction, using a single getCharacters call to populate both CharacterAutocomplete and FactionAutocomplete.
Implementation:

Added state for selectedType, selectedFaction, selectedCharacter, characterRecords, and factionRecords.
Fetched data with client.getCharacters, setting characterRecords and factionRecords as records for the autocompletes.
Used useCallback and useEffect to re-fetch when filters change.

Code:
const filters = {
  faction_id: selectedFaction?.id ? String(selectedFaction.id) : "",
  type: selectedType?.id ? String(selectedType.id) : ""
}

const fetchRecords = useCallback(async () => {
  try {
    const response = await client.getCharacters({ autocomplete: true, per_page: 200, ...filters })
    setCharacterRecords(response.data.characters)
    setFactionRecords(response.data.factions)
  } catch (error) {
    console.error("Failed to fetch records:", error)
  }
}, [client, selectedFaction, selectedType])

useEffect(() => {
  fetchRecords()
}, [fetchRecords])

Choices and Decisions:

Single Fetch: Used one getCharacters call to avoid duplicate requests, as it returns both characters and factions.
State Management: Centralized state in CharacterFilter to coordinate records and filters.
String IDs: Converted IDs to strings (String(selectedFaction.id)) assuming API requirements, adjustable if numbers are accepted.

4. Adding an External List Update (onCharactersUpdate)
Feature: Allow CharacterFilter to update an external character list via onCharactersUpdate.
Implementation:

Added onCharactersUpdate?: (characters: AutocompleteOption[]) => void to CharacterFilterProps.
Called onCharactersUpdate(characters) in fetchRecords.

Code:
if (onCharactersUpdate) {
  onCharactersUpdate(characters)
}

Choices and Decisions:

Optional Prop: Made onCharactersUpdate optional for flexibility in use cases without an external list.
Direct Data Passing: Passed characters directly to minimize processing, as they matched AutocompleteOption.

5. Supporting an Add Button
Feature: Add an AddButton to confirm character selection, clear the dropdown, and notify the parent via onChange.
Implementation:

Added AddButton from "@/components/ui" to the Stack.
Implemented handleAdd to call onChange(selectedCharacter) and clear selectedCharacter.
Added characterKey to force CharacterAutocomplete rerender for UI clearing.

Code:
const handleAdd = () => {
  if (selectedCharacter) {
    onChange(selectedCharacter)
    setSelectedCharacter(null)
    setCharacterKey(`character-${keyCounter}`)
    setKeyCounter((prev) => prev + 1)
  }
}

Choices and Decisions:

Custom Button: Used AddButton over MUI’s Button to match the user’s UI kit.
Key Prop: Added characterKey to address MUI Autocomplete caching issues, ensuring visual clearing.
Clear on Add: Cleared selectedCharacter to allow multiple selections, aligning with the user’s intent.

6. Optional Component Rendering with omit Prop
Feature: Support omitting components (type, faction, character, add) via an omit prop.
Implementation:

Added omit?: Array<"type" | "faction" | "character" | "add"> to CharacterFilterProps.
Conditionally rendered components using !omit.includes("type"), etc.
Adjusted filters to exclude omitted components’ values.

Code:
const filters = {
  faction_id: !omit.includes("faction") && selectedFaction?.id ? String(selectedFaction.id) : "",
  type: !omit.includes("type") && selectedType?.id ? String(selectedType.id) : ""
}

Choices and Decisions:

Union Type: Used a union type for omit to ensure type safety and clarity.
Conditional Filters: Excluded filter values for omitted components to prevent unnecessary API constraints.
Default Empty Array: Set omit default to [] for backward compatibility.

7. Clearing FactionAutocomplete and Re-Fetching
Feature: Ensure clearing TypeAutocomplete or FactionAutocomplete re-fetches data and updates FactionAutocomplete options, with visual clearing.
Implementation:

Added factionKey to force FactionAutocomplete rerender on clear.
Updated fetchRecords dependencies to include selectedType and selectedFaction for re-fetching.

Code:
const handleFactionChange = (value: AutocompleteOption | null) => {
  setSelectedFaction(value)
  if (!value) {
    setFactionKey(`faction-${keyCounter}`)
    setKeyCounter((prev) => prev + 1)
  }
}

Choices and Decisions:

Key for Faction: Added factionKey (e.g., "faction-1") to ensure visual clearing, mirroring characterKey.
Direct Dependencies: Used selectedType and selectedFaction in useCallback to trigger re-fetch on clear, avoiding reliance on filters values.

8. Adding ArchetypeAutocomplete
Feature: Create ArchetypeAutocomplete for string options (archetypes: string[]) from getCharacters, filtering out null or empty strings.
Implementation:

Created ArchetypeAutocomplete to handle string[] options directly, as ModelAutocomplete expects AutocompleteOption.
Added selectedArchetype and archetypeRecords to CharacterFilter.
Filtered archetypes in fetchRecords to exclude null or empty strings.
Added "archetype" to omit options.

Code (ArchetypeAutocomplete):
interface ArchetypeAutocompleteProps {
  value: string | null
  onChange: (value: string | null) => void
  filters: Record<string, string>
  records?: string[]
  sx?: SxProps<Theme>
}

export function ArchetypeAutocomplete({ value, onChange, filters, records, sx }: ArchetypeAutocompleteProps) {
  const { client } = useClient()
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (records) {
      setOptions(records)
      return
    }
    const fetchArchetypes = async () => {
      try {
        setLoading(true)
        const response = await client.getArchetypes({ autocomplete: true, per_page: 200, ...filters })
        setOptions(response.data.archetypes)
      } catch (error) {
        console.error("Failed to fetch archetypes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchArchetypes()
  }, [client, filters, records])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      loading={loading}
      sx={sx}
      renderInput={(params) => (
        <TextField {...params} label="Select Archetype" variant="outlined" />
      )}
    />
  )
}

Code (CharacterFilter excerpt):
const archetypes = response.data.archetypes.filter((archetype: string | null) => archetype && archetype.trim() !== "")

Choices and Decisions:

Direct Autocomplete: Used MUI’s Autocomplete for ArchetypeAutocomplete instead of ModelAutocomplete to handle strings, avoiding complex type conversions.
Filtering: Excluded null and empty strings to ensure valid options, using trim() for robustness.
Fallback Endpoint: Assumed client.getArchetypes for standalone use, matching the API pattern.

9. Adding a Spinner for Loading
Feature: Show a spinner in ModelAutocomplete and ArchetypeAutocomplete until options are populated.
Implementation:

Added CircularProgress to renderInput’s InputProps.endAdornment when loading is true and options is empty.
Applied to both ModelAutocomplete and ArchetypeAutocomplete.

Code (ModelAutocomplete excerpt):
renderInput={(params) => (
  <TextField
    {...params}
    label={label}
    variant="outlined"
    InputProps={{
      ...params.InputProps,
      endAdornment: (
        <>
          {loading && options.length === 0 ? <CircularProgress size={20} /> : null}
          {params.InputProps.endAdornment}
        </>
      )
    }}
  />
)}

Choices and Decisions:

Conditional Spinner: Only showed the spinner when options is empty to avoid clutter during partial updates.
MUI Component: Used CircularProgress for consistency with MUI’s design.
Small Size: Set size={20} for a compact spinner, fitting the input field.

Final Thoughts
The development of ModelAutocomplete and CharacterFilter was an iterative process driven by specific user needs:

Reusability: ModelAutocomplete supports multiple models with generics, while wrappers like CharacterAutocomplete provide model-specific configuration.
Flexibility: The omit prop and records allow varied use cases, from standalone autocompletes to integrated filters.
Type Safety: TypeScript ensured robust types, avoiding any and aligning with the user’s preference.
UI Feedback: Spinners and key-based rerendering addressed MUI’s quirks, ensuring a smooth user experience.

Key decisions included using MUI for consistency, centralizing data fetching in CharacterFilter, and incrementally adding features like omit and spinners to meet evolving requirements. The final components are reusable, maintainable, and ready for further extensions (e.g., error feedback, search-as-you-type).