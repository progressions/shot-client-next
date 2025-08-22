import React from "react"
import { render, RenderOptions } from "@testing-library/react"
import { AppProvider, ToastProvider, LocalStorageProvider } from "@/contexts"
import { ThemeProvider } from "@mui/material/styles"
import { createTheme } from "@mui/material/styles"
import type { User, Campaign } from "@/types"

const theme = createTheme()

// Enhanced mock fixtures for comprehensive testing
export const mockUser: User = {
  id: "test-user-1",
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  name: "Test User",
  gamemaster: false,
  admin: false,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
  image_url: "",
  entity_class: "User",
  active: true,
}

export const mockGamemaster: User = {
  ...mockUser,
  id: "test-gm-1",
  first_name: "Game",
  last_name: "Master",
  email: "gm@example.com",
  name: "Game Master",
  gamemaster: true,
}

export const mockAdmin: User = {
  ...mockUser,
  id: "test-admin-1",
  first_name: "Admin",
  last_name: "User",
  email: "admin@example.com",
  name: "Admin User",
  admin: true,
  gamemaster: true,
}

export const mockCampaign: Campaign = {
  id: "test-campaign-1",
  name: "Test Campaign",
  description: "A test campaign",
  gamemaster_id: "test-gm-1",
  entity_class: "Campaign",
  active: true,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
}

export const mockSecondaryCampaign: Campaign = {
  id: "test-campaign-2",
  name: "Secondary Campaign",
  description: "A secondary test campaign",
  gamemaster_id: "test-gm-1",
  entity_class: "Campaign",
  active: true,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
}

// Mock client functions
export const createMockClient = (overrides = {}) => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ data: mockUser })),
  getCurrentCampaign: jest.fn(() => Promise.resolve({ data: mockCampaign })),
  setCurrentCampaign: jest.fn(() => Promise.resolve({ data: mockCampaign })),
  updateUser: jest.fn(() => Promise.resolve({ data: mockUser })),
  createCampaign: jest.fn(() => Promise.resolve({ data: mockCampaign })),
  deleteCampaign: jest.fn(() => Promise.resolve({ data: {} })),
  logout: jest.fn(() => Promise.resolve({ data: {} })),
  consumer: jest.fn(() => ({
    subscriptions: {
      create: jest.fn(() => ({
        unsubscribe: jest.fn(),
        send: jest.fn(),
      })),
    },
  })),
  ...overrides,
})

// Mock localStorage for testing
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
}

// Mock cookies for testing
export const createMockCookies = (
  initialValues: Record<string, string> = {}
) => ({
  get: jest.fn((key: string) => initialValues[key]),
  set: jest.fn(),
  remove: jest.fn(),
})

// Mock ActionCable consumer for testing
export const createMockActionCableConsumer = () => ({
  subscriptions: {
    create: jest.fn((channel: string | object, callbacks: object) => {
      const subscription = {
        unsubscribe: jest.fn(),
        send: jest.fn(),
        channel: typeof channel === "string" ? channel : channel,
        callbacks: callbacks,
      }

      // Store reference for manual triggering in tests
      ;(subscription as any).__triggerCallback = (name: string, data: any) => {
        if ((callbacks as any)[name]) {
          ;(callbacks as any)[name](data)
        }
      }

      return subscription
    }),
  },
})

interface EnhancedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // User state options
  initialUser?: User
  initialCampaign?: Campaign
  initialCampaigns?: Campaign[]

  // Client options
  mockClient?: ReturnType<typeof createMockClient>

  // Storage options
  mockLocalStorage?: ReturnType<typeof createMockLocalStorage>
  mockCookies?: ReturnType<typeof createMockCookies>

  // WebSocket options
  mockConsumer?: ReturnType<typeof createMockActionCableConsumer>

  // JWT token for authentication tests
  mockJWT?: string

  // Provider options
  withRealProviders?: boolean // Use real providers instead of mocks
  skipProviders?: string[] // Skip specific providers
}

interface TestProvidersProps extends EnhancedRenderOptions {
  children: React.ReactNode
}

const EnhancedTestProviders = ({
  children,
  initialUser = mockUser,
  initialCampaign = mockCampaign,
  initialCampaigns = [mockCampaign],
  mockClient = createMockClient(),
  mockLocalStorage = createMockLocalStorage(),
  mockCookies = createMockCookies(),
  mockConsumer = createMockActionCableConsumer(),
  mockJWT = "test-jwt-token",
  withRealProviders = false,
  skipProviders = [],
}: TestProvidersProps) => {
  // Set up mocks before rendering
  React.useEffect(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    })

    // Set up initial localStorage state
    if (initialUser && mockJWT) {
      mockLocalStorage.setItem(`user_${mockJWT}`, JSON.stringify(initialUser))
      mockLocalStorage.setItem("jwtToken", mockJWT)
    }
    if (initialCampaign) {
      mockLocalStorage.setItem(
        `campaign_${initialUser.id}`,
        JSON.stringify(initialCampaign)
      )
    }
  }, [])

  if (withRealProviders) {
    // Use real providers for integration testing
    let providers = (
      <ThemeProvider theme={theme}>
        <LocalStorageProvider>
          <AppProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppProvider>
        </LocalStorageProvider>
      </ThemeProvider>
    )

    // Skip providers if requested
    if (skipProviders.includes("AppProvider")) {
      providers = (
        <ThemeProvider theme={theme}>
          <LocalStorageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LocalStorageProvider>
        </ThemeProvider>
      )
    }

    return providers
  }

  // Mock provider context values for unit testing
  const mockAppContextValue = {
    user: initialUser,
    currentCampaign: initialCampaign,
    campaigns: initialCampaigns,
    client: mockClient,
    jwt: mockJWT,
    state: {
      loading: false,
      error: null,
    },
    setUser: jest.fn(),
    setCurrentCampaign: jest.fn(),
    setCampaigns: jest.fn(),
    logout: jest.fn(),
    isGamemaster: initialUser?.gamemaster || false,
    isAdmin: initialUser?.admin || false,
    subscription: mockConsumer.subscriptions.create("CampaignChannel", {}),
  }

  const mockToastContextValue = {
    toast: { success: null, error: null, info: null, warning: null },
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
    toastInfo: jest.fn(),
    toastWarning: jest.fn(),
  }

  const mockLocalStorageContextValue = {
    getLocalStorageItem: mockLocalStorage.getItem,
    setLocalStorageItem: mockLocalStorage.setItem,
    removeLocalStorageItem: mockLocalStorage.removeItem,
    clearLocalStorage: mockLocalStorage.clear,
  }

  return (
    <ThemeProvider theme={theme}>
      <div data-testid="mock-localstorage-provider">
        <div data-testid="mock-app-provider">
          <div data-testid="mock-toast-provider">{children}</div>
        </div>
      </div>
    </ThemeProvider>
  )
}

const renderWithEnhancedProviders = (
  ui: React.ReactElement,
  options: EnhancedRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <EnhancedTestProviders {...options}>{children}</EnhancedTestProviders>
    ),
    ...options,
  })
}

// Utility functions for test setup
export const setupMockEnvironment = (
  options: {
    jwt?: string
    user?: User
    campaign?: Campaign
    localStorage?: ReturnType<typeof createMockLocalStorage>
    cookies?: ReturnType<typeof createMockCookies>
  } = {}
) => {
  const {
    jwt = "test-jwt-token",
    user = mockUser,
    campaign = mockCampaign,
    localStorage = createMockLocalStorage(),
    cookies = createMockCookies({ jwtToken: jwt }),
  } = options

  // Setup localStorage
  localStorage.setItem("jwtToken", jwt)
  localStorage.setItem(`user_${jwt}`, JSON.stringify(user))
  localStorage.setItem(`campaign_${user.id}`, JSON.stringify(campaign))

  return {
    mockJWT: jwt,
    mockUser: user,
    mockCampaign: campaign,
    mockLocalStorage: localStorage,
    mockCookies: cookies,
  }
}

// Authentication test utilities
export const mockAuthenticationSuccess = (
  client: ReturnType<typeof createMockClient>,
  user = mockUser
) => {
  client.getCurrentUser.mockResolvedValue({ data: user })
  return user
}

export const mockAuthenticationFailure = (
  client: ReturnType<typeof createMockClient>,
  error = { response: { status: 401 } }
) => {
  client.getCurrentUser.mockRejectedValue(error)
  return error
}

// Campaign test utilities
export const mockCampaignSuccess = (
  client: ReturnType<typeof createMockClient>,
  campaign = mockCampaign
) => {
  client.getCurrentCampaign.mockResolvedValue({ data: campaign })
  client.setCurrentCampaign.mockResolvedValue({ data: campaign })
  return campaign
}

export const mockCampaignFailure = (
  client: ReturnType<typeof createMockClient>,
  error = { response: { status: 404 } }
) => {
  client.getCurrentCampaign.mockRejectedValue(error)
  client.setCurrentCampaign.mockRejectedValue(error)
  return error
}

// Re-export everything from testing-library
export * from "@testing-library/react"
export { renderWithEnhancedProviders as render }
export { EnhancedTestProviders as TestProviders }
