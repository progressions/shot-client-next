import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import NotionSyncLogList from "./NotionSyncLogList"
import { Character, NotionSyncLog } from "@/types"

// Helper to flush all pending promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock the contexts
const mockGetNotionSyncLogs = jest.fn()
const mockSyncCharacterToNotion = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()
const mockSubscribeToEntity = jest.fn()

// Create stable mock objects to prevent infinite re-renders
// (useCallback depends on client, which must be a stable reference)
const mockClient = {
  getNotionSyncLogs: mockGetNotionSyncLogs,
  syncCharacterToNotion: mockSyncCharacterToNotion,
}
const mockClientHook = { client: mockClient }
const mockToastHook = {
  toastSuccess: mockToastSuccess,
  toastError: mockToastError,
}
const mockCampaignHook = {
  subscribeToEntity: mockSubscribeToEntity,
}

jest.mock("@/contexts", () => ({
  useClient: () => mockClientHook,
  useToast: () => mockToastHook,
  useCampaign: () => mockCampaignHook,
}))

// Mock UI components
jest.mock("@/components/ui", () => ({
  SectionHeader: ({
    title,
    children,
    actions,
  }: {
    title: string
    children: React.ReactNode
    actions: React.ReactNode
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{children}</p>
      <div data-testid="section-actions">{actions}</div>
    </div>
  ),
  Icon: ({ keyword }: { keyword: string }) => <span>Icon: {keyword}</span>,
}))

// Mock MUI Collapse to render children immediately without animation
jest.mock("@mui/material/Collapse", () => {
  return {
    __esModule: true,
    default: ({
      in: isOpen,
      children,
    }: {
      in: boolean
      children: React.ReactNode
    }) =>
      isOpen ? <div data-testid="collapse-content">{children}</div> : null,
  }
})

describe("NotionSyncLogList", () => {
  const mockCharacter: Character = {
    id: "char-1",
    name: "Test Character",
  } as Character

  const mockLogs: NotionSyncLog[] = [
    {
      id: "log-1",
      character_id: "char-1",
      status: "success",
      created_at: "2026-01-07T12:00:00Z",
      payload: { name: "Test Character" },
      response: { id: "notion-page-1" },
      error_message: null,
    },
    {
      id: "log-2",
      character_id: "char-1",
      status: "error",
      created_at: "2026-01-06T12:00:00Z",
      payload: { name: "Test Character" },
      response: null,
      error_message: "API rate limit exceeded",
    },
  ]

  const mockLogsResponse = {
    data: {
      notion_sync_logs: mockLogs,
      meta: { total_pages: 2, current_page: 1, per_page: 5, total_count: 10 },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribeToEntity.mockReturnValue(jest.fn()) // Return unsubscribe function
    mockGetNotionSyncLogs.mockResolvedValue(mockLogsResponse)
  })

  describe("Initial State", () => {
    it("renders the section header", () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      expect(screen.getByText("Notion Sync History")).toBeInTheDocument()
      expect(
        screen.getByText(
          "View the history of syncs to Notion for this character."
        )
      ).toBeInTheDocument()
    })

    it("starts collapsed and does not fetch logs initially", () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      expect(screen.getByText("Show")).toBeInTheDocument()
      expect(mockGetNotionSyncLogs).not.toHaveBeenCalled()
    })

    it("fetches logs when expanded", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledWith("char-1", {
          page: 1,
          per_page: 5,
        })
      })
    })
  })

  describe("Log Display", () => {
    it("displays logs after expanding", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument()
      })
      expect(screen.getByText("Error")).toBeInTheDocument()
    })

    it("displays error message for failed syncs", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("API rate limit exceeded")).toBeInTheDocument()
      })
    })

    it("shows empty message when no logs exist", async () => {
      mockGetNotionSyncLogs.mockResolvedValue({
        data: {
          notion_sync_logs: [],
          meta: {
            total_pages: 1,
            current_page: 1,
            per_page: 5,
            total_count: 0,
          },
        },
      })

      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(
          screen.getByText("No sync history available.")
        ).toBeInTheDocument()
      })
    })
  })

  describe("Sync Now Button", () => {
    it("triggers sync when clicked", async () => {
      mockSyncCharacterToNotion.mockResolvedValue({})

      render(<NotionSyncLogList character={mockCharacter} />)

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync Now")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync Now"))

      await waitFor(() => {
        expect(mockSyncCharacterToNotion).toHaveBeenCalledWith("char-1")
        expect(mockToastSuccess).toHaveBeenCalledWith("Character sync queued")
      })
    })

    it("shows error toast when sync fails", async () => {
      mockSyncCharacterToNotion.mockRejectedValue(new Error("Sync failed"))

      render(<NotionSyncLogList character={mockCharacter} />)

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync Now")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync Now"))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to queue character sync"
        )
      })
    })
  })

  describe("Pagination", () => {
    it("renders pagination controls after loading", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument()
      })

      expect(screen.getByRole("navigation")).toBeInTheDocument()
    })

    it("fetches new page when pagination changes", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument()
      })

      expect(mockGetNotionSyncLogs).toHaveBeenCalledWith("char-1", {
        page: 1,
        per_page: 5,
      })

      // Click page 2
      const page2Button = screen.getByRole("button", { name: "Go to page 2" })

      await act(async () => {
        fireEvent.click(page2Button)
        await flushPromises()
      })

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledWith("char-1", {
          page: 2,
          per_page: 5,
        })
      })
    })
  })

  describe("Expand/Collapse Log Details", () => {
    it("expands log details when clicked", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument()
      })

      // Find the clickable row by role="button"
      const expandableRows = screen.getAllByRole("button")
      const logRow = expandableRows.find(row =>
        row.textContent?.includes("Success")
      )

      expect(logRow).toBeDefined()

      if (logRow) {
        fireEvent.click(logRow)

        await waitFor(() => {
          expect(screen.getByText("Payload")).toBeInTheDocument()
        })
        expect(screen.getByText("Response")).toBeInTheDocument()
      }
    })

    it("supports keyboard navigation for accessibility", async () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      await act(async () => {
        fireEvent.click(screen.getByText("Show"))
        await flushPromises()
      })

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument()
      })

      const expandableRows = screen.getAllByRole("button")
      const logRow = expandableRows.find(row =>
        row.textContent?.includes("Success")
      )

      expect(logRow).toBeDefined()

      if (logRow) {
        // Test Enter key
        fireEvent.keyDown(logRow, { key: "Enter" })

        await waitFor(() => {
          expect(screen.getByText("Payload")).toBeInTheDocument()
        })
      }
    })
  })

  describe("Error Handling", () => {
    it("shows toast error when log fetch fails", async () => {
      mockGetNotionSyncLogs.mockRejectedValue(new Error("Network error"))

      render(<NotionSyncLogList character={mockCharacter} />)

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to load Notion sync logs. Please try again."
        )
      })
    })
  })

  describe("WebSocket Updates", () => {
    it("subscribes to WebSocket on mount", () => {
      render(<NotionSyncLogList character={mockCharacter} />)

      expect(mockSubscribeToEntity).toHaveBeenCalledWith(
        "notion_sync_logs",
        expect.any(Function)
      )
    })

    it("unsubscribes from WebSocket on unmount", () => {
      const mockUnsubscribe = jest.fn()
      mockSubscribeToEntity.mockReturnValue(mockUnsubscribe)

      const { unmount } = render(
        <NotionSyncLogList character={mockCharacter} />
      )

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it("reloads logs when WebSocket broadcasts for this character", async () => {
      let wsCallback: (data: unknown) => void = () => {}

      mockSubscribeToEntity.mockImplementation(
        (_entity: string, callback: (data: unknown) => void) => {
          wsCallback = callback
          return jest.fn()
        }
      )

      render(<NotionSyncLogList character={mockCharacter} />)

      // Expand to trigger initial fetch
      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(1)
      })

      // Simulate WebSocket message for this character
      wsCallback({ character_id: "char-1" })

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(2)
      })
    })

    it("ignores WebSocket broadcasts for other characters", async () => {
      let wsCallback: (data: unknown) => void = () => {}

      mockSubscribeToEntity.mockImplementation(
        (_entity: string, callback: (data: unknown) => void) => {
          wsCallback = callback
          return jest.fn()
        }
      )

      render(<NotionSyncLogList character={mockCharacter} />)

      // Expand to trigger initial fetch
      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(1)
      })

      // Simulate WebSocket message for different character
      wsCallback({ character_id: "other-char" })

      // Should not trigger another fetch - wait a bit to ensure no additional call
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(1)
    })
  })
})
