import React from "react"
import { render, screen, fireEvent, waitFor } from "@/test-utils"
import { SearchModal } from "../SearchModal"

// Mock lodash.debounce to execute immediately in tests
jest.mock("lodash.debounce", () =>
  jest.fn(fn => {
    const debounced = fn
    debounced.cancel = jest.fn()
    return debounced
  })
)

// Mock next/navigation
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock maps.tsx to avoid circular dependency issues
jest.mock("@/lib/maps", () => ({
  getUrl: (entityClass: string, id: string, name?: string) =>
    `/${entityClass.toLowerCase()}s/${id}`,
}))

// Mock the client context
const mockSearch = jest.fn()
jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: {
      search: mockSearch,
    },
  }),
  useCampaign: () => ({
    campaignData: null,
  }),
}))

// Mock badge components to avoid circular dependency issues
jest.mock("@/components/badges", () => ({
  CharacterBadge: ({ character }: { character: { name: string } }) => (
    <div data-testid="character-badge">{character.name}</div>
  ),
  VehicleBadge: ({ vehicle }: { vehicle: { name: string } }) => (
    <div data-testid="vehicle-badge">{vehicle.name}</div>
  ),
  FightBadge: ({ fight }: { fight: { name: string } }) => (
    <div data-testid="fight-badge">{fight.name}</div>
  ),
  SiteBadge: ({ site }: { site: { name: string } }) => (
    <div data-testid="site-badge">{site.name}</div>
  ),
  PartyBadge: ({ party }: { party: { name: string } }) => (
    <div data-testid="party-badge">{party.name}</div>
  ),
  FactionBadge: ({ faction }: { faction: { name: string } }) => (
    <div data-testid="faction-badge">{faction.name}</div>
  ),
  SchtickBadge: ({ schtick }: { schtick: { name: string } }) => (
    <div data-testid="schtick-badge">{schtick.name}</div>
  ),
  WeaponBadge: ({ weapon }: { weapon: { name: string } }) => (
    <div data-testid="weapon-badge">{weapon.name}</div>
  ),
  JunctureBadge: ({ juncture }: { juncture: { name: string } }) => (
    <div data-testid="juncture-badge">{juncture.name}</div>
  ),
  AdventureBadge: ({ adventure }: { adventure: { name: string } }) => (
    <div data-testid="adventure-badge">{adventure.name}</div>
  ),
}))

// Helper to create mock character data matching what badge components expect
const createMockCharacter = (
  overrides: Partial<{
    id: string
    name: string
    image_url: string | null
    action_values: Record<string, unknown>
    description: Record<string, string>
    faction: { id: string; name: string; entity_class: string } | null
  }> = {}
) => ({
  id: "1",
  name: "Test Character",
  image_url: null,
  entity_class: "Character",
  action_values: {
    Type: "PC",
    Archetype: "Martial Artist",
    MainAttack: "Martial Arts",
    "Martial Arts": 14,
    Defense: 13,
    Toughness: 6,
    Speed: 7,
    Fortune: 7,
    "Max Fortune": 7,
    Wounds: 0,
    "Marks of Death": 0,
  },
  description: {
    Nicknames: "",
    Age: "",
    Height: "",
    Weight: "",
    "Hair Color": "",
    "Eye Color": "",
    "Style of Dress": "",
    Appearance: "A test character",
    Background: "",
    "Melodramatic Hook": "",
  },
  skills: {},
  faction: null,
  faction_id: null,
  juncture_id: null,
  user_id: "user-1",
  task: false,
  active: true,
  at_a_glance: false,
  extending: false,
  color: "#000000",
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
})

// Helper to create mock site data
const createMockSite = (
  overrides: Partial<{
    id: string
    name: string
    description: string | null
    image_url: string | null
  }> = {}
) => ({
  id: "2",
  name: "Test Site",
  description: "A test site",
  image_url: null,
  entity_class: "Site",
  faction: null,
  faction_id: null,
  campaign_id: "campaign-1",
  characters: [],
  character_ids: [],
  active: true,
  at_a_glance: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
})

describe("SearchModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock scrollIntoView which is not implemented in jsdom
    Element.prototype.scrollIntoView = jest.fn()
  })

  it("renders when open", () => {
    render(<SearchModal {...defaultProps} />)
    expect(
      screen.getByPlaceholderText("Search characters, sites, factions...")
    ).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(<SearchModal {...defaultProps} open={false} />)
    expect(
      screen.queryByPlaceholderText("Search characters, sites, factions...")
    ).not.toBeInTheDocument()
  })

  it("displays 'Start typing to search' initially", () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByText("Start typing to search")).toBeInTheDocument()
  })

  it("calls search when typing", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {},
        meta: { query: "test", limit_per_type: 5, total_count: 0 },
      },
    })
    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("test")
    })
  })

  it("displays loading state while searching", async () => {
    // Create a promise that doesn't resolve immediately
    let resolveSearch: (value: unknown) => void
    mockSearch.mockReturnValue(
      new Promise(resolve => {
        resolveSearch = resolve
      })
    )

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolveSearch!({
      data: {
        results: {},
        meta: { query: "test", limit_per_type: 5, total_count: 0 },
      },
    })
  })

  it("displays 'No results found' when search returns empty", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {},
        meta: { query: "nonexistent", limit_per_type: 5, total_count: 0 },
      },
    })
    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "nonexistent" } })

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })

  it("displays search results grouped by entity type", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            createMockCharacter({ id: "1", name: "Test Character" }),
          ],
          sites: [createMockSite({ id: "2", name: "Test Site" })],
        },
        meta: { query: "test", limit_per_type: 5, total_count: 2 },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(screen.getByText("Characters")).toBeInTheDocument()
      expect(screen.getByText("Sites")).toBeInTheDocument()
      expect(screen.getByText("Test Character")).toBeInTheDocument()
      expect(screen.getByText("Test Site")).toBeInTheDocument()
    })
  })

  it("navigates to result when clicked", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            createMockCharacter({ id: "abc123", name: "Test Character" }),
          ],
        },
        meta: { query: "test", limit_per_type: 5, total_count: 1 },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(screen.getByText("Test Character")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Test Character"))

    expect(mockPush).toHaveBeenCalled()
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("closes on Escape key", () => {
    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.keyDown(input, { key: "Escape" })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("navigates with arrow keys", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            createMockCharacter({ id: "1", name: "First Character" }),
            createMockCharacter({ id: "2", name: "Second Character" }),
          ],
        },
        meta: { query: "char", limit_per_type: 5, total_count: 2 },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "char" } })

    await waitFor(() => {
      expect(screen.getByText("First Character")).toBeInTheDocument()
    })

    // First item should be selected initially
    const firstItem = screen
      .getByText("First Character")
      .closest('[role="option"]')
    expect(firstItem).toHaveAttribute("aria-selected", "true")

    // Arrow down to second item
    fireEvent.keyDown(input, { key: "ArrowDown" })

    const secondItem = screen
      .getByText("Second Character")
      .closest('[role="option"]')
    expect(secondItem).toHaveAttribute("aria-selected", "true")
  })

  it("selects result with Enter key", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            createMockCharacter({ id: "abc123", name: "Test Character" }),
          ],
        },
        meta: { query: "test", limit_per_type: 5, total_count: 1 },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(screen.getByText("Test Character")).toBeInTheDocument()
    })

    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockPush).toHaveBeenCalled()
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("has proper accessibility attributes", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            createMockCharacter({ id: "1", name: "Test Character" }),
          ],
        },
        meta: { query: "test", limit_per_type: 5, total_count: 1 },
      },
    })

    render(<SearchModal {...defaultProps} />)

    // Dialog should have aria-labelledby
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-labelledby", "search-dialog-title")

    // Input should have aria-label
    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    expect(input).toHaveAttribute("aria-label", "Search")

    fireEvent.change(input, { target: { value: "test" } })

    await waitFor(() => {
      expect(screen.getByText("Test Character")).toBeInTheDocument()
    })

    // Results container should have listbox role
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    // Result items should have option role
    const options = screen.getAllByRole("option")
    expect(options.length).toBeGreaterThan(0)
  })
})
