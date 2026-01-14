import FightsModule from "./FightsModule"
import { getServerClient } from "@/lib"

// Mock the dependencies
jest.mock("@/lib", () => ({
  getServerClient: jest.fn(),
}))

jest.mock("@/components/badges", () => ({
  FightBadge: () => <div>FightBadge</div>,
}))

jest.mock("./FightsModuleClient", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock("@/components/dashboard", () => ({
  ErrorModule: () => <div>ErrorModule</div>,
  ModuleHeader: () => <div>ModuleHeader</div>,
}))

jest.mock("@/components/ui", () => ({
  Icon: () => <div>Icon</div>,
}))

describe("FightsModule", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calls getFights with at_a_glance: true", async () => {
    const mockGetFights = jest.fn().mockResolvedValue({
      data: { fights: [] },
    })

    ;(getServerClient as jest.Mock).mockResolvedValue({
      getFights: mockGetFights,
    })

    // Call the component as an async function
    await FightsModule({ userId: "user-123" })

    expect(mockGetFights).toHaveBeenCalledWith(
      expect.objectContaining({
        at_a_glance: true,
        user_id: "user-123",
      })
    )
    const callArgs = mockGetFights.mock.calls[0]?.[0]
    expect(callArgs).not.toHaveProperty("status")
  })

  it("handles errors gracefully", async () => {
    const mockGetFights = jest.fn().mockRejectedValue(new Error("API Error"))

    ;(getServerClient as jest.Mock).mockResolvedValue({
      getFights: mockGetFights,
    })

    const result = await FightsModule({ userId: "user-123" })

    // It should return the ErrorModule
    expect(result).toBeDefined()
  })
})
