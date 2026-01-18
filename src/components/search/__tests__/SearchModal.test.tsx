import React from "react"
import { render, screen, fireEvent, waitFor } from "@/test-utils"
import { SearchModal } from "../SearchModal"

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
}))

describe("SearchModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Mock scrollIntoView which is not implemented in jsdom
    Element.prototype.scrollIntoView = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
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

  it("calls search after debounce when typing", async () => {
    mockSearch.mockResolvedValue({ data: { results: {} } })
    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    // Advance timers past debounce
    jest.advanceTimersByTime(200)

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

    jest.advanceTimersByTime(200)

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolveSearch!({ data: { results: {} } })
  })

  it("displays 'No results found' when search returns empty", async () => {
    mockSearch.mockResolvedValue({ data: { results: {} } })
    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "nonexistent" } })

    jest.advanceTimersByTime(200)

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })

  it("displays search results grouped by entity type", async () => {
    mockSearch.mockResolvedValue({
      data: {
        results: {
          characters: [
            {
              id: "1",
              name: "Test Character",
              entity_class: "Character",
              image_url: null,
              description: "A test character",
            },
          ],
          sites: [
            {
              id: "2",
              name: "Test Site",
              entity_class: "Site",
              image_url: null,
              description: "A test site",
            },
          ],
        },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    jest.advanceTimersByTime(200)

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
            {
              id: "abc123",
              name: "Test Character",
              entity_class: "Character",
              image_url: null,
              description: null,
            },
          ],
        },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    jest.advanceTimersByTime(200)

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
            {
              id: "1",
              name: "First Character",
              entity_class: "Character",
              image_url: null,
              description: null,
            },
            {
              id: "2",
              name: "Second Character",
              entity_class: "Character",
              image_url: null,
              description: null,
            },
          ],
        },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "char" } })

    jest.advanceTimersByTime(200)

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
            {
              id: "abc123",
              name: "Test Character",
              entity_class: "Character",
              image_url: null,
              description: null,
            },
          ],
        },
      },
    })

    render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    jest.advanceTimersByTime(200)

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
            {
              id: "1",
              name: "Test Character",
              entity_class: "Character",
              image_url: null,
              description: null,
            },
          ],
        },
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
    jest.advanceTimersByTime(200)

    await waitFor(() => {
      expect(screen.getByText("Test Character")).toBeInTheDocument()
    })

    // Results container should have listbox role
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    // Result items should have option role
    const options = screen.getAllByRole("option")
    expect(options.length).toBeGreaterThan(0)
  })

  it("cleans up debounce timeout on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")

    const { unmount } = render(<SearchModal {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      "Search characters, sites, factions..."
    )
    fireEvent.change(input, { target: { value: "test" } })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
