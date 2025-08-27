import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import CreatePage from "./CreatePage"
import { Character } from "@/types"

// Mock the router
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock the contexts
const mockDuplicateCharacter = jest.fn()
const mockRefreshUser = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: {
      duplicateCharacter: mockDuplicateCharacter,
    },
  }),
  useApp: () => ({
    refreshUser: mockRefreshUser,
  }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

// Mock UI components
jest.mock("@/components/ui", () => ({
  MainHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
  Icon: ({ keyword }: { keyword: string }) => <span>Icon: {keyword}</span>,
}))

// Mock character components
jest.mock("@/components/characters/SpeedDial", () => ({
  __esModule: true,
  default: () => <div>SpeedDial</div>,
}))

jest.mock("@/components/characters/PCTemplatePreviewCard", () => ({
  __esModule: true,
  default: ({ template, onSelect, isLoading }: { template: unknown; onSelect: (t: unknown) => void; isLoading: boolean }) => (
    <div
      onClick={() => !isLoading && onSelect(template)}
      role="article"
      aria-label={template.name}
      style={{ opacity: isLoading ? 0.5 : 1 }}
    >
      <h3>{template.name}</h3>
      <span>{template.archetype}</span>
    </div>
  ),
}))

describe("CreatePage", () => {
  const mockTemplates: Character[] = [
    {
      id: "1",
      name: "Archer",
      archetype: "Archer",
      skills: { Archery: 3 },
      schticks: [{ id: "s1", name: "Eagle Eye" }],
      weapons: [
        { id: "w1", name: "Bow", damage: 10, concealment: 0, reload: 0 },
      ],
    },
    {
      id: "2",
      name: "Big Bruiser",
      archetype: "Big Bruiser",
      skills: { "Martial Arts": 3 },
      schticks: [{ id: "s2", name: "Tough" }],
      weapons: [],
    },
    {
      id: "3",
      name: "Cyborg",
      archetype: "Cyborg",
      skills: { Guns: 3 },
      schticks: [{ id: "s3", name: "Hardware" }],
      weapons: [
        { id: "w2", name: "Cyberlimb", damage: 12, concealment: 0, reload: 0 },
      ],
    },
  ] as Character[]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Layout and Display", () => {
    it("displays the main header with correct title", () => {
      render(<CreatePage templates={mockTemplates} />)

      expect(screen.getByText("Create Player Character")).toBeInTheDocument()
      expect(
        screen.getByText("Choose an archetype to create your character")
      ).toBeInTheDocument()
    })

    it("renders all template cards without carousel", () => {
      render(<CreatePage templates={mockTemplates} />)

      // All templates should be visible
      expect(screen.getByText("Archer")).toBeInTheDocument()
      expect(screen.getByText("Big Bruiser")).toBeInTheDocument()
      expect(screen.getByText("Cyborg")).toBeInTheDocument()

      // No carousel controls
      expect(
        screen.queryByRole("button", { name: /next/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: /previous/i })
      ).not.toBeInTheDocument()
    })

    it("displays result count", () => {
      render(<CreatePage templates={mockTemplates} />)
      expect(screen.getByText(/Showing 3 of 3 templates/i)).toBeInTheDocument()
    })

    it("handles empty templates gracefully", () => {
      render(<CreatePage templates={[]} />)
      expect(
        screen.getByText(/No character templates available/i)
      ).toBeInTheDocument()
    })
  })

  describe("Search and Filter", () => {
    it("shows search functionality", () => {
      render(<CreatePage templates={mockTemplates} />)
      const searchInput = screen.getByPlaceholderText(/search templates/i)
      expect(searchInput).toBeInTheDocument()
    })

    it("filters templates based on search input", () => {
      render(<CreatePage templates={mockTemplates} />)

      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: "Archer" } })

      expect(screen.getByText("Archer")).toBeInTheDocument()
      expect(screen.queryByText("Big Bruiser")).not.toBeInTheDocument()
      expect(screen.queryByText("Cyborg")).not.toBeInTheDocument()
    })

    it("shows filter options", () => {
      render(<CreatePage templates={mockTemplates} />)

      expect(screen.getByLabelText(/archetype/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/has weapons/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/has schticks/i)).toBeInTheDocument()
    })

    it("filters templates by has weapons", () => {
      render(<CreatePage templates={mockTemplates} />)

      const hasWeaponsCheckbox = screen.getByLabelText(/has weapons/i)
      fireEvent.click(hasWeaponsCheckbox)

      expect(screen.getByText("Archer")).toBeInTheDocument()
      expect(screen.queryByText("Big Bruiser")).not.toBeInTheDocument()
      expect(screen.getByText("Cyborg")).toBeInTheDocument()
    })

    it("clears all filters when clear button is clicked", () => {
      render(<CreatePage templates={mockTemplates} />)

      // Apply a filter
      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: "Archer" } })

      expect(screen.queryByText("Big Bruiser")).not.toBeInTheDocument()

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i)
      fireEvent.click(clearButton)

      // All templates should be visible again
      expect(screen.getByText("Archer")).toBeInTheDocument()
      expect(screen.getByText("Big Bruiser")).toBeInTheDocument()
      expect(screen.getByText("Cyborg")).toBeInTheDocument()
    })

    it("updates result count when filtering", () => {
      render(<CreatePage templates={mockTemplates} />)

      const searchInput = screen.getByPlaceholderText(/search templates/i)
      fireEvent.change(searchInput, { target: { value: "Archer" } })

      expect(screen.getByText(/Showing 1 of 3 templates/i)).toBeInTheDocument()
    })
  })

  describe("Character Creation", () => {
    it("creates character directly without confirmation dialog", async () => {
      mockDuplicateCharacter.mockResolvedValue({
        data: { id: "new-1", name: "New Archer" },
      })
      mockRefreshUser.mockResolvedValue(undefined)

      render(<CreatePage templates={mockTemplates} />)

      // Click on a template card
      const archerCard = screen.getByRole("article", { name: "Archer" })
      fireEvent.click(archerCard)

      // Should not show confirmation dialog
      expect(
        screen.queryByText(/confirm character creation/i)
      ).not.toBeInTheDocument()

      // Should call duplicate API directly
      await waitFor(() => {
        expect(mockDuplicateCharacter).toHaveBeenCalledWith(mockTemplates[0])
      })

      // Should refresh user and redirect
      await waitFor(() => {
        expect(mockRefreshUser).toHaveBeenCalled()
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Created new character: New Archer"
        )
        expect(mockPush).toHaveBeenCalledWith("/characters/new-1")
      })
    })

    it("shows loading overlay during character creation", async () => {
      mockDuplicateCharacter.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  data: { id: "new-1", name: "New Archer" },
                }),
              100
            )
          )
      )

      render(<CreatePage templates={mockTemplates} />)

      // Click on a template card
      const archerCard = screen.getByRole("article", { name: "Archer" })
      fireEvent.click(archerCard)

      // Should show loading overlay
      expect(screen.getByRole("progressbar")).toBeInTheDocument()

      // Wait for creation to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it("handles creation error gracefully", async () => {
      mockDuplicateCharacter.mockRejectedValue(new Error("Creation failed"))

      render(<CreatePage templates={mockTemplates} />)

      const archerCard = screen.getByRole("article", { name: "Archer" })
      fireEvent.click(archerCard)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to create character from template"
        )
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })
})
