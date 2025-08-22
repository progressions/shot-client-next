import React from "react"
import { render, RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { createTheme } from "@mui/material/styles"
import type { User, Campaign } from "@/types"

const theme = createTheme()

// Mock user fixtures
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

interface TestProvidersProps {
  children: React.ReactNode
  initialUser?: User
  initialCampaign?: Campaign
}

const TestProviders = ({
  children,
  initialUser = mockUser,
  initialCampaign = mockCampaign,
}: TestProvidersProps) => {
  // Mock the AppProvider's initial state
  const mockAppContextValue = {
    user: initialUser,
    currentCampaign: initialCampaign,
    campaigns: [initialCampaign],
    setUser: jest.fn(),
    setCurrentCampaign: jest.fn(),
    setCampaigns: jest.fn(),
    logout: jest.fn(),
    isGamemaster: initialUser?.gamemaster || false,
    isAdmin: initialUser?.admin || false,
  }

  const mockToastContextValue = {
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
    toastInfo: jest.fn(),
    toastWarning: jest.fn(),
  }

  return (
    <ThemeProvider theme={theme}>
      <div data-testid="mock-app-provider">
        <div data-testid="mock-toast-provider">{children}</div>
      </div>
    </ThemeProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialUser?: User
  initialCampaign?: Campaign
}

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialUser, initialCampaign, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders
        initialUser={initialUser}
        initialCampaign={initialCampaign}
      >
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from "@testing-library/react"
export { customRender as render }
