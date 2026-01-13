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

const mockSyncCharacterFromNotion = jest.fn()

// Create stable mock objects to prevent infinite re-renders
// (useCallback depends on client, which must be a stable reference)
const mockClient = {
  getNotionSyncLogs: mockGetNotionSyncLogs,
  syncCharacterToNotion: mockSyncCharacterToNotion,
  syncCharacterFromNotion: mockSyncCharacterFromNotion,
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
    notion_page_id: null,
  } as Character

  const mockLogs: NotionSyncLog[] = [
    {
      id: "log-1",
      entity_type: "character",
      entity_id: "char-1",
      character_id: "char-1",
      status: "success",
      created_at: "2026-01-07T12:00:00Z",
      updated_at: "2026-01-07T12:00:00Z",
      payload: { name: "Test Character" },
      response: { id: "notion-page-1" },
      error_message: null,
    },
    {
      id: "log-2",
      entity_type: "character",
      entity_id: "char-1",
      character_id: "char-1",
      status: "error",
      created_at: "2026-01-06T12:00:00Z",
      updated_at: "2026-01-06T12:00:00Z",
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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      expect(screen.getByText("Notion Sync History")).toBeInTheDocument()
      expect(
        screen.getByText(
          "View the history of syncs to Notion for this character."
        )
      ).toBeInTheDocument()
    })

    it("starts collapsed and does not fetch logs initially", () => {
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      expect(screen.getByText("Show")).toBeInTheDocument()
      expect(mockGetNotionSyncLogs).not.toHaveBeenCalled()
    })

    it("fetches logs when expanded", async () => {
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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

      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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

  describe("Sync to Notion Button", () => {
    it("triggers sync when clicked", async () => {
      mockSyncCharacterToNotion.mockResolvedValue({})

      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync to Notion")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync to Notion"))

      await waitFor(() => {
        expect(mockSyncCharacterToNotion).toHaveBeenCalledWith("char-1")
        expect(mockToastSuccess).toHaveBeenCalledWith("Character sync queued")
      })
    })

    it("shows error toast when sync fails", async () => {
      mockSyncCharacterToNotion.mockRejectedValue(new Error("Sync failed"))

      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync to Notion")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync to Notion"))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to sync character to Notion"
        )
      })
    })
  })

  describe("Sync from Notion Button", () => {
    const characterWithNotionPage: Character = {
      id: "char-1",
      name: "Test Character",
      notion_page_id: "notion-page-123",
    } as Character

    it("triggers sync from Notion when clicked", async () => {
      mockSyncCharacterFromNotion.mockResolvedValue({
        data: characterWithNotionPage,
      })

      render(
        <NotionSyncLogList
          entity={characterWithNotionPage}
          entityType="character"
        />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync from Notion")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync from Notion"))

      await waitFor(() => {
        expect(mockSyncCharacterFromNotion).toHaveBeenCalledWith("char-1")
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Character updated from Notion"
        )
      })
    })

    it("shows error toast when sync from Notion fails", async () => {
      mockSyncCharacterFromNotion.mockRejectedValue(new Error("Sync failed"))

      render(
        <NotionSyncLogList
          entity={characterWithNotionPage}
          entityType="character"
        />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync from Notion")).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText("Sync from Notion"))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to sync from Notion"
        )
      })
    })

    it("button is disabled when character has no notion_page_id", async () => {
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync from Notion")).toBeInTheDocument()
      })

      const syncFromButton = screen
        .getByText("Sync from Notion")
        .closest("button")
      expect(syncFromButton).toBeDisabled()
    })

    it("button is enabled when character has notion_page_id", async () => {
      render(
        <NotionSyncLogList
          entity={characterWithNotionPage}
          entityType="character"
        />
      )

      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(screen.getByText("Sync from Notion")).toBeInTheDocument()
      })

      const syncFromButton = screen
        .getByText("Sync from Notion")
        .closest("button")
      expect(syncFromButton).not.toBeDisabled()
    })
  })

  describe("Pagination", () => {
    it("renders pagination controls after loading", async () => {
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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

      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

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
      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      expect(mockSubscribeToEntity).toHaveBeenCalledWith(
        "notion_sync_logs",
        expect.any(Function)
      )
    })

    it("unsubscribes from WebSocket on unmount", () => {
      const mockUnsubscribe = jest.fn()
      mockSubscribeToEntity.mockReturnValue(mockUnsubscribe)

      const { unmount } = render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it("reloads logs when WebSocket broadcasts notion_sync_logs", async () => {
      let wsCallback: (data: unknown) => void = () => {}

      mockSubscribeToEntity.mockImplementation(
        (_entity: string, callback: (data: unknown) => void) => {
          wsCallback = callback
          return jest.fn()
        }
      )

      render(
        <NotionSyncLogList entity={mockCharacter} entityType="character" />
      )

      // Expand to trigger initial fetch
      fireEvent.click(screen.getByText("Show"))

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(1)
      })

      // Simulate WebSocket broadcast - callback receives the value ("reload")
      // Component reloads for any notion_sync_logs broadcast in the campaign
      wsCallback("reload")

      await waitFor(() => {
        expect(mockGetNotionSyncLogs).toHaveBeenCalledTimes(2)
      })
    })
  })
})
