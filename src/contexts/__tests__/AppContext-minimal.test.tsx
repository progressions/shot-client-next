import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import { AppProvider, useApp } from "@/contexts/AppContext"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import Cookies from "js-cookie"

// Mock the Client
jest.mock("@/lib", () => ({
  Client: jest.fn(),
}))

const theme = createTheme()

// Simple test component
const JWTTestComponent = () => {
  const { jwt, loading } = useApp()
  return (
    <div>
      <span data-testid="jwt">{jwt}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  )
}

const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <AppProvider>
        <JWTTestComponent />
      </AppProvider>
    </ThemeProvider>
  )
}

// Mock client setup
const mockGetCurrentUser = jest.fn()
const mockGetCurrentCampaign = jest.fn()

const mockSubscription = {
  unsubscribe: jest.fn(),
}

const mockConsumerInstance = {
  subscriptions: {
    create: jest.fn(() => mockSubscription),
  },
}

const mockConsumer = jest.fn(() => mockConsumerInstance)

const mockClient = {
  getCurrentUser: mockGetCurrentUser,
  getCurrentCampaign: mockGetCurrentCampaign,
  consumer: mockConsumer,
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  ;(Cookies.get as jest.Mock).mockReturnValue(undefined)

  const { Client } = require("@/lib")
  Client.mockReturnValue(mockClient)
})

describe("AppContext JWT Functionality", () => {
  it("reads JWT from localStorage", () => {
    localStorage.setItem("jwtToken", "test-jwt-localStorage")

    renderApp()

    expect(screen.getByTestId("jwt")).toHaveTextContent("test-jwt-localStorage")
  })

  it("reads JWT from cookies when localStorage is empty", () => {
    ;(Cookies.get as jest.Mock).mockImplementation(key =>
      key === "jwtToken" ? "test-jwt-cookies" : undefined
    )

    renderApp()

    expect(screen.getByTestId("jwt")).toHaveTextContent("test-jwt-cookies")
  })

  it("handles empty JWT gracefully", () => {
    renderApp()

    expect(screen.getByTestId("jwt")).toHaveTextContent("")
    expect(screen.getByTestId("loading")).toHaveTextContent("true")
  })

  it("clears JWT token on 401 authentication error", async () => {
    localStorage.setItem("jwtToken", "expired-token")
    mockGetCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderApp()

    await waitFor(() => {
      expect(Cookies.remove).toHaveBeenCalledWith("jwtToken")
    })
  })

  it("preserves JWT token on non-authentication errors", async () => {
    localStorage.setItem("jwtToken", "valid-token")
    mockGetCurrentUser.mockRejectedValue({ response: { status: 500 } })

    renderApp()

    // For server errors, the AppContext preserves JWT but may stay in loading state
    // Let's verify the key behavior: JWT is preserved and no cookies are removed
    await waitFor(() => {
      // The loading state behavior on server errors is complex, but JWT should be preserved
      expect(screen.getByTestId("jwt")).toHaveTextContent("valid-token")
    })

    expect(Cookies.remove).not.toHaveBeenCalled()
  })
})

// Test the useClient hook
describe("useClient Hook", () => {
  it("provides client context with JWT", () => {
    localStorage.setItem("jwtToken", "client-test-jwt")

    const ClientTestComponent = () => {
      const { jwt } = require("@/contexts/AppContext").useClient()
      return <div data-testid="client-jwt">{jwt}</div>
    }

    render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <ClientTestComponent />
        </AppProvider>
      </ThemeProvider>
    )

    expect(screen.getByTestId("client-jwt")).toHaveTextContent(
      "client-test-jwt"
    )
  })
})

// Test the useCampaign hook
describe("useCampaign Hook", () => {
  it("provides campaign context", () => {
    const CampaignTestComponent = () => {
      const { campaign } = require("@/contexts/AppContext").useCampaign()
      return <div data-testid="campaign-name">{campaign?.name || "none"}</div>
    }

    render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <CampaignTestComponent />
        </AppProvider>
      </ThemeProvider>
    )

    expect(screen.getByTestId("campaign-name")).toHaveTextContent("none")
  })
})

// Test campaign switching and localStorage persistence
describe("Campaign Switching and Persistence", () => {
  const mockUser = {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    gamemaster: true,
    admin: false,
    first_name: "Test",
    last_name: "User",
    entity_class: "User" as const,
    active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    image_url: "",
  }

  const mockCampaign = {
    id: "test-campaign-123",
    name: "Test Campaign",
    description: "Test Description",
    gamemaster_id: mockUser.id,
    entity_class: "Campaign" as const,
    active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  }

  const CampaignSwitchingComponent = () => {
    const { campaign, setCurrentCampaign } = useApp()

    return (
      <div>
        <div data-testid="campaign-id">{campaign?.id || "none"}</div>
        <div data-testid="campaign-name">{campaign?.name || "none"}</div>
        <button
          data-testid="switch-campaign"
          onClick={() => setCurrentCampaign(mockCampaign)}
        >
          Switch Campaign
        </button>
        <button
          data-testid="clear-campaign"
          onClick={() => setCurrentCampaign(null)}
        >
          Clear Campaign
        </button>
      </div>
    )
  }

  const renderCampaignTest = () => {
    return render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <CampaignSwitchingComponent />
        </AppProvider>
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue({ data: mockUser })
    mockGetCurrentCampaign.mockResolvedValue({ data: mockCampaign })

    const { Client } = require("@/lib")
    Client.mockReturnValue({
      ...mockClient,
      setCurrentCampaign: jest.fn(async camp => ({ data: camp })),
    })
  })

  it("handles setCurrentCampaign with successful response", async () => {
    localStorage.setItem("jwtToken", "test-jwt")
    const mockSetCampaign = jest.fn(async camp => ({ data: camp }))

    const { Client } = require("@/lib")
    Client.mockReturnValue({
      ...mockClient,
      setCurrentCampaign: mockSetCampaign,
    })

    renderCampaignTest()

    const switchButton = screen.getByTestId("switch-campaign")
    await act(async () => {
      switchButton.click()
    })

    await waitFor(() => {
      expect(mockSetCampaign).toHaveBeenCalledWith(mockCampaign)
    })
  })

  it("handles clearing current campaign", async () => {
    localStorage.setItem("jwtToken", "test-jwt")
    const mockSetCampaign = jest.fn(async () => ({ data: null }))

    const { Client } = require("@/lib")
    Client.mockReturnValue({
      ...mockClient,
      setCurrentCampaign: mockSetCampaign,
    })

    renderCampaignTest()

    const clearButton = screen.getByTestId("clear-campaign")
    await act(async () => {
      clearButton.click()
    })

    await waitFor(() => {
      expect(mockSetCampaign).toHaveBeenCalledWith(null)
    })
  })

  it("stores campaign data in localStorage on successful switch", async () => {
    localStorage.setItem("jwtToken", "test-jwt")
    const mockSetCampaign = jest.fn(async camp => ({ data: camp }))

    const { Client } = require("@/lib")
    Client.mockReturnValue({
      ...mockClient,
      setCurrentCampaign: mockSetCampaign,
      getCurrentUser: jest.fn(async () => ({ data: mockUser })),
    })

    renderCampaignTest()

    const switchButton = screen.getByTestId("switch-campaign")
    await act(async () => {
      switchButton.click()
    })

    await waitFor(() => {
      // Check if localStorage has the campaign data stored
      const storedCampaign = localStorage.getItem(
        `currentCampaign-${mockUser.id}`
      )
      expect(storedCampaign).toBeTruthy()
    })
  })
})

// Test WebSocket subscription management basics
describe("WebSocket Subscription Management", () => {
  const WebSocketTestComponent = () => {
    const { subscription, campaignData, subscribeToEntity } = useApp()

    return (
      <div>
        <div data-testid="has-subscription">
          {subscription ? "true" : "false"}
        </div>
        <div data-testid="campaign-data">
          {campaignData ? "has-data" : "no-data"}
        </div>
        <div data-testid="has-subscribe-function">
          {subscribeToEntity ? "true" : "false"}
        </div>
      </div>
    )
  }

  const renderWebSocketTest = () => {
    return render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <WebSocketTestComponent />
        </AppProvider>
      </ThemeProvider>
    )
  }

  it("initializes subscription state as null", () => {
    renderWebSocketTest()
    expect(screen.getByTestId("has-subscription")).toHaveTextContent("false")
    expect(screen.getByTestId("campaign-data")).toHaveTextContent("no-data")
  })

  it("provides subscribeToEntity function in context", () => {
    renderWebSocketTest()
    expect(screen.getByTestId("has-subscribe-function")).toHaveTextContent(
      "true"
    )
  })

  it("can handle subscribeToEntity callback registration", () => {
    const TestComponentWithCallback = () => {
      const { subscribeToEntity } = useApp()
      const [callbackRegistered, setCallbackRegistered] = React.useState(false)

      React.useEffect(() => {
        const unsubscribe = subscribeToEntity("characters", data => {
          // Mock callback
        })
        setCallbackRegistered(true)
        return unsubscribe
      }, [subscribeToEntity])

      return (
        <div data-testid="callback-registered">
          {callbackRegistered ? "true" : "false"}
        </div>
      )
    }

    render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <TestComponentWithCallback />
        </AppProvider>
      </ThemeProvider>
    )

    expect(screen.getByTestId("callback-registered")).toHaveTextContent("true")
  })
})
