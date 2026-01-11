import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { NotionSyncButton } from "./NotionSyncButton"
import type { Site, Party, Faction } from "@/types"

const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()
const mockSyncSiteToNotion = jest.fn()
const mockSyncPartyToNotion = jest.fn()
const mockSyncFactionToNotion = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useClient: () => ({
    user: mockUser,
    client: {
      syncSiteToNotion: mockSyncSiteToNotion,
      syncPartyToNotion: mockSyncPartyToNotion,
      syncFactionToNotion: mockSyncFactionToNotion,
    },
  }),
  useCampaign: () => ({
    campaign: mockCampaign,
  }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

let mockUser: { id: string; admin: boolean; gamemaster?: boolean } = {
  id: "1",
  admin: false,
}
let mockCampaign: { id: string; gamemaster_id: string } = {
  id: "campaign1",
  gamemaster_id: "2",
}

const createMockSite = (overrides?: Partial<Site>): Site =>
  ({
    id: "site1",
    name: "Test Site",
    notion_page_id: null,
    last_synced_to_notion_at: null,
    ...overrides,
  }) as Site

const createMockParty = (overrides?: Partial<Party>): Party =>
  ({
    id: "party1",
    name: "Test Party",
    notion_page_id: null,
    last_synced_to_notion_at: null,
    ...overrides,
  }) as Party

const createMockFaction = (overrides?: Partial<Faction>): Faction =>
  ({
    id: "faction1",
    name: "Test Faction",
    notion_page_id: null,
    last_synced_to_notion_at: null,
    ...overrides,
  }) as Faction

describe("NotionSyncButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: "1", admin: false }
    mockCampaign = { id: "campaign1", gamemaster_id: "2" }
  })

  describe("Permission visibility", () => {
    it("should not render for regular users", () => {
      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.queryByText(/Create in Notion/i)).not.toBeInTheDocument()
    })

    it("should render for admin users", () => {
      mockUser = { id: "1", admin: true }

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.getByText(/Create in Notion/i)).toBeInTheDocument()
    })

    it("should render for gamemaster of current campaign", () => {
      mockUser = { id: "2", admin: false }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.getByText(/Create in Notion/i)).toBeInTheDocument()
    })

    it("should not render for gamemaster of different campaign", () => {
      mockUser = { id: "3", admin: false }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.queryByText(/Create in Notion/i)).not.toBeInTheDocument()
    })
  })

  describe("Button text and state", () => {
    beforeEach(() => {
      mockUser = { id: "1", admin: true }
    })

    it("should show 'Create in Notion' when no notion_page_id exists", () => {
      render(
        <NotionSyncButton
          entity={createMockSite({ notion_page_id: null })}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.getByText(/Create in Notion/i)).toBeInTheDocument()
    })

    it("should show 'Sync to Notion' when notion_page_id exists", () => {
      render(
        <NotionSyncButton
          entity={createMockSite({ notion_page_id: "abc123" })}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.getByText(/Sync to Notion/i)).toBeInTheDocument()
    })

    it("should show Notion link button when notion_page_id exists", () => {
      render(
        <NotionSyncButton
          entity={createMockSite({ notion_page_id: "abc-123-def" })}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      const linkButton = screen.getByRole("link", { name: /Open in Notion/i })
      expect(linkButton).toBeInTheDocument()
      expect(linkButton).toHaveAttribute(
        "href",
        "https://www.notion.so/isaacrpg/abc123def"
      )
    })

    it("should display last synced time when available", () => {
      const syncDate = new Date("2025-01-11T10:30:00Z").toISOString()
      render(
        <NotionSyncButton
          entity={createMockSite({
            notion_page_id: "abc123",
            last_synced_to_notion_at: syncDate,
          })}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      expect(screen.getByText(/Last synced:/i)).toBeInTheDocument()
    })
  })

  describe("Sync functionality", () => {
    beforeEach(() => {
      mockUser = { id: "1", admin: true }
    })

    it("should call syncSiteToNotion when syncing a site", async () => {
      const mockOnSync = jest.fn()
      const updatedSite = createMockSite({ notion_page_id: "new-page-id" })
      mockSyncSiteToNotion.mockResolvedValueOnce({ data: updatedSite })

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={mockOnSync}
        />
      )

      const button = screen.getByText(/Create in Notion/i)
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSyncSiteToNotion).toHaveBeenCalledWith(
          expect.objectContaining({ id: "site1" })
        )
      })

      await waitFor(() => {
        expect(mockOnSync).toHaveBeenCalledWith(updatedSite)
        expect(mockToastSuccess).toHaveBeenCalledWith("Site synced to Notion")
      })
    })

    it("should call syncPartyToNotion when syncing a party", async () => {
      const mockOnSync = jest.fn()
      const updatedParty = createMockParty({ notion_page_id: "new-page-id" })
      mockSyncPartyToNotion.mockResolvedValueOnce({ data: updatedParty })

      render(
        <NotionSyncButton
          entity={createMockParty()}
          entityType="party"
          onSync={mockOnSync}
        />
      )

      const button = screen.getByText(/Create in Notion/i)
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSyncPartyToNotion).toHaveBeenCalledWith(
          expect.objectContaining({ id: "party1" })
        )
      })

      await waitFor(() => {
        expect(mockOnSync).toHaveBeenCalledWith(updatedParty)
        expect(mockToastSuccess).toHaveBeenCalledWith("Party synced to Notion")
      })
    })

    it("should call syncFactionToNotion when syncing a faction", async () => {
      const mockOnSync = jest.fn()
      const updatedFaction = createMockFaction({
        notion_page_id: "new-page-id",
      })
      mockSyncFactionToNotion.mockResolvedValueOnce({ data: updatedFaction })

      render(
        <NotionSyncButton
          entity={createMockFaction()}
          entityType="faction"
          onSync={mockOnSync}
        />
      )

      const button = screen.getByText(/Create in Notion/i)
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSyncFactionToNotion).toHaveBeenCalledWith(
          expect.objectContaining({ id: "faction1" })
        )
      })

      await waitFor(() => {
        expect(mockOnSync).toHaveBeenCalledWith(updatedFaction)
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Faction synced to Notion"
        )
      })
    })

    it("should show error toast on sync failure", async () => {
      mockSyncSiteToNotion.mockRejectedValueOnce(new Error("API Error"))

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      const button = screen.getByText(/Create in Notion/i)
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to sync site to Notion"
        )
      })
    })

    it("should disable button when clicked", () => {
      // Use a promise that never resolves to test the disabled state
      mockSyncSiteToNotion.mockReturnValue(new Promise(() => {}))

      render(
        <NotionSyncButton
          entity={createMockSite()}
          entityType="site"
          onSync={jest.fn()}
        />
      )

      const button = screen.getByText(/Create in Notion/i).closest("button")!
      expect(button).not.toBeDisabled()

      fireEvent.click(button)

      // Button should be disabled while syncing
      expect(button).toBeDisabled()
    })
  })
})
