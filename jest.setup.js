import "@testing-library/jest-dom"

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3004"
process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3004"
process.env.NEXT_PUBLIC_WEBSOCKET_URL = "http://localhost:3004"

// Mock window.matchMedia for Material-UI
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
    searchParams: new URLSearchParams(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

// Mock axios
jest.mock("axios", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}))

// Mock @rails/actioncable
jest.mock("@rails/actioncable", () => ({
  createConsumer: jest.fn(() => ({
    subscriptions: {
      create: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    },
  })),
}))

// Mock lodash.debounce
jest.mock("lodash.debounce", () => jest.fn((fn) => fn))

// Mock MessageChannel for server-side rendering
global.MessageChannel = class MessageChannel {
  constructor() {
    this.port1 = { postMessage: jest.fn(), onmessage: null }
    this.port2 = { postMessage: jest.fn(), onmessage: null }
  }
}

// Mock React DOM Server
jest.mock("react-dom/server", () => ({
  renderToStaticMarkup: jest.fn((component) => `<div>Mocked: ${component}</div>`),
  renderToString: jest.fn((component) => `<div>Mocked: ${component}</div>`),
}))

// Mock pluralize
jest.mock("pluralize", () => {
  const mockFn = jest.fn((word) => word + "s")
  mockFn.singular = jest.fn((word) => word.replace(/s$/, ""))
  mockFn.plural = jest.fn((word) => word + "s")
  return mockFn
})

// Suppress console errors for tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Warning:") ||
        args[0].includes("Error fetching") ||
        args[0].includes("Error updating entity") ||
        args[0].includes("Error deleting") ||
        args[0].includes("Error creating") ||
        args[0].includes("An update to") ||
        args[0].includes("act(...)") ||
        args[0].includes("Error:"))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})