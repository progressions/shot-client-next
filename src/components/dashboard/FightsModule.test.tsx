import { render, screen, waitFor, act } from "@testing-library/react"
import FightsModule from "./FightsModule"

// Mock the contexts with stable references
const mockGetFights = jest.fn()
const mockSubscribeToEntity = jest.fn()
const mockUnsubscribe = jest.fn()

// Create stable client object
const mockClient = {
  getFights: mockGetFights,
}

jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: mockClient,
  }),
  useCampaign: () => ({
    subscribeToEntity: mockSubscribeToEntity,
  }),
}))

jest.mock("@/components/badges", () => ({
  FightBadge: ({ fight }: { fight: { id: string; name: string } }) => (
    <div data-testid={`fight-${fight.id}`}>{fight.name}</div>
  ),
}))

jest.mock("@/components/dashboard", () => ({
  ErrorModule: ({ message }: { message: string }) => (
    <div data-testid="error-module">{message}</div>
  ),
  ModuleHeader: ({ title }: { title: string }) => (
    <div data-testid="module-header">{title}</div>
  ),
}))

jest.mock("@/components/ui", () => ({
  Icon: () => <div>Icon</div>,
}))

describe("FightsModule", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribeToEntity.mockReturnValue(mockUnsubscribe)
  })

  it("calls getFights with at_a_glance: true", async () => {
    mockGetFights.mockResolvedValue({
      data: { fights: [] },
    })

    await act(async () => {
      render(<FightsModule userId="user-123" />)
    })

    await waitFor(() => {
      expect(mockGetFights).toHaveBeenCalledWith(
        expect.objectContaining({
          at_a_glance: true,
          user_id: "user-123",
        })
      )
    })

    const callArgs = mockGetFights.mock.calls[0]?.[0]
    expect(callArgs).not.toHaveProperty("status")
  })

  it("displays fights when loaded successfully", async () => {
    mockGetFights.mockResolvedValue({
      data: {
        fights: [
          { id: "fight-1", name: "Test Fight 1" },
          { id: "fight-2", name: "Test Fight 2" },
        ],
      },
    })

    await act(async () => {
      render(<FightsModule userId="user-123" />)
    })

    // Wait for data to load and component to re-render
    await waitFor(
      () => {
        expect(screen.getByTestId("fight-fight-1")).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(screen.getByTestId("fight-fight-2")).toBeInTheDocument()
  })

  it("handles errors gracefully", async () => {
    mockGetFights.mockRejectedValue(new Error("API Error"))

    await act(async () => {
      render(<FightsModule userId="user-123" />)
    })

    // Wait for error state
    await waitFor(
      () => {
        expect(screen.getByTestId("error-module")).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })

  it("subscribes to WebSocket updates", async () => {
    mockGetFights.mockResolvedValue({
      data: { fights: [] },
    })

    await act(async () => {
      render(<FightsModule userId="user-123" />)
    })

    await waitFor(() => {
      expect(mockSubscribeToEntity).toHaveBeenCalledWith(
        "fights",
        expect.any(Function)
      )
    })
  })

  it("refetches data when WebSocket sends reload signal", async () => {
    mockGetFights.mockResolvedValue({
      data: { fights: [] },
    })

    // Capture the callback passed to subscribeToEntity
    let reloadCallback: (data: string) => void = () => {}
    mockSubscribeToEntity.mockImplementation(
      (entity: string, callback: (data: string) => void) => {
        if (entity === "fights") {
          reloadCallback = callback
        }
        return mockUnsubscribe
      }
    )

    await act(async () => {
      render(<FightsModule userId="user-123" />)
    })

    await waitFor(() => {
      expect(mockGetFights).toHaveBeenCalledTimes(1)
    })

    // Simulate WebSocket reload signal
    await act(async () => {
      reloadCallback("reload")
    })

    await waitFor(() => {
      expect(mockGetFights).toHaveBeenCalledTimes(2)
    })
  })
})
