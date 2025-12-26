import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import Cookies from "js-cookie"
import PlayerViewMagicLinkPage from "../page"
import { UserActions } from "@/reducers"

// Mock next/navigation
const mockPush = jest.fn()
const mockParams = { token: "" }

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/magic-link/test-token",
  }),
  useParams: () => mockParams,
}))

// Mock the client context
const mockDispatchCurrentUser = jest.fn()

jest.mock("@/contexts", () => ({
  useClient: () => ({
    dispatchCurrentUser: mockDispatchCurrentUser,
  }),
}))

// Mock createClient
const mockRedeemPlayerViewToken = jest.fn()

jest.mock("@/lib/client", () => ({
  createClient: jest.fn(() => ({
    redeemPlayerViewToken: mockRedeemPlayerViewToken,
  })),
}))

describe("PlayerViewMagicLinkPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockParams.token = ""
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("Loading State", () => {
    it("shows loading state while redeeming token", () => {
      mockParams.token = "valid-player-view-token"
      mockRedeemPlayerViewToken.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      render(<PlayerViewMagicLinkPage />)

      expect(screen.getByText(/joining the encounter/i)).toBeInTheDocument()
      expect(
        screen.getByText(/please wait while we set up your player view/i)
      ).toBeInTheDocument()
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })

  describe("Successful Token Redemption", () => {
    const mockUser = {
      id: "user-123",
      email: "player@example.com",
      name: "Test Player",
    }

    const mockSuccessResponse = {
      data: {
        jwt: "jwt-token-from-player-view",
        user: mockUser,
        encounter_id: "encounter-456",
        character_id: "character-789",
        redirect_url: "/encounters/encounter-456/play/character-789",
      },
    }

    beforeEach(() => {
      mockParams.token = "valid-player-view-token"
      mockRedeemPlayerViewToken.mockResolvedValue(mockSuccessResponse)
    })

    it("redeems player view token successfully", async () => {
      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(mockRedeemPlayerViewToken).toHaveBeenCalledWith(
          "valid-player-view-token"
        )
      })

      await waitFor(() => {
        expect(screen.getByText(/welcome to the fight/i)).toBeInTheDocument()
      })

      expect(
        screen.getByText(/redirecting you to the player view/i)
      ).toBeInTheDocument()
    })

    it("sets JWT cookie on successful redemption", async () => {
      render(<PlayerViewMagicLinkPage />)

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith(
          "jwtToken",
          "jwt-token-from-player-view",
          expect.objectContaining({
            expires: 7,
            sameSite: "Lax",
            path: "/",
          })
        )
      })
    })

    it("sets user ID cookie on successful redemption", async () => {
      render(<PlayerViewMagicLinkPage />)

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith(
          "userId",
          "user-123",
          expect.objectContaining({
            expires: 7,
            sameSite: "Lax",
            path: "/",
          })
        )
      })
    })

    it("dispatches current user to context", async () => {
      render(<PlayerViewMagicLinkPage />)

      await waitFor(() => {
        expect(mockDispatchCurrentUser).toHaveBeenCalledWith({
          type: UserActions.USER,
          payload: mockUser,
        })
      })
    })

    it("redirects to Player View after brief delay", async () => {
      render(<PlayerViewMagicLinkPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome to the fight/i)).toBeInTheDocument()
      })

      // Fast-forward the redirect timer
      act(() => {
        jest.advanceTimersByTime(1500)
      })

      expect(mockPush).toHaveBeenCalledWith(
        "/encounters/encounter-456/play/character-789"
      )
    })

    it("cleans up timeout on unmount", async () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")

      const { unmount } = render(<PlayerViewMagicLinkPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome to the fight/i)).toBeInTheDocument()
      })

      // Clear the spy call count before unmount (other timers may have been cleared)
      clearTimeoutSpy.mockClear()

      // Unmount should trigger cleanup
      unmount()

      // Verify clearTimeout was called during cleanup
      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })
  })

  describe("Error Handling", () => {
    beforeEach(() => {
      mockParams.token = "some-token"
    })

    it("shows error when token redemption fails with invalid token", async () => {
      mockRedeemPlayerViewToken.mockResolvedValue({
        data: {}, // No jwt/user means invalid
      })

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument()
      })
    })

    it("shows error for expired token from API", async () => {
      mockRedeemPlayerViewToken.mockRejectedValue({
        response: {
          data: {
            error: "Token has expired",
          },
        },
      })

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/token has expired/i)).toBeInTheDocument()
      })
    })

    it("shows error for already used token", async () => {
      mockRedeemPlayerViewToken.mockRejectedValue({
        response: {
          data: {
            error: "Token has already been used",
          },
        },
      })

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/token has already been used/i)
        ).toBeInTheDocument()
      })
    })

    it("shows generic error when API call fails without specific error", async () => {
      mockRedeemPlayerViewToken.mockRejectedValue(new Error("Network error"))

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/failed to verify magic link/i)
        ).toBeInTheDocument()
      })
    })

    it("displays helpful message about expiration", async () => {
      mockRedeemPlayerViewToken.mockRejectedValue(new Error("Token expired"))

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/links are valid for 10 minutes/i)
        ).toBeInTheDocument()
      })
    })

    it("provides link back to login page on error", async () => {
      mockRedeemPlayerViewToken.mockRejectedValue(new Error("Invalid"))

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        const backButton = screen.getByRole("link", { name: /back to login/i })
        expect(backButton).toBeInTheDocument()
        expect(backButton).toHaveAttribute("href", "/login")
      })
    })
  })

  describe("Edge Cases", () => {
    it("handles missing user in response", async () => {
      mockParams.token = "valid-token"
      mockRedeemPlayerViewToken.mockResolvedValue({
        data: {
          jwt: "token",
          // user is missing
          redirect_url: "/encounters/1/play/2",
        },
      })

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument()
      })
    })

    it("handles missing jwt in response", async () => {
      mockParams.token = "valid-token"
      mockRedeemPlayerViewToken.mockResolvedValue({
        data: {
          user: { id: "123", email: "test@test.com" },
          redirect_url: "/encounters/1/play/2",
        },
      })

      await act(async () => {
        render(<PlayerViewMagicLinkPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument()
      })
    })
  })
})
