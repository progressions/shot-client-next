import "@testing-library/jest-dom"

// Add TextEncoder/TextDecoder for Node.js environment
import { TextEncoder, TextDecoder } from "util"
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

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

// Enhanced @rails/actioncable mock for context testing
jest.mock("@rails/actioncable", () => ({
  createConsumer: jest.fn((url) => {
    const subscriptions = new Map()
    const consumer = {
      url,
      subscriptions: {
        create: jest.fn((channelName, callbacks = {}) => {
          const subscription = {
            identifier: JSON.stringify(channelName),
            unsubscribe: jest.fn(() => {
              subscriptions.delete(subscription.identifier)
            }),
            send: jest.fn(),
            perform: jest.fn(),
            // Store callbacks for manual triggering in tests
            _callbacks: callbacks,
            // Helper to trigger callbacks manually in tests
            _trigger: (callbackName, data) => {
              if (callbacks[callbackName]) {
                callbacks[callbackName](data)
              }
            },
          }
          
          subscriptions.set(subscription.identifier, subscription)
          
          // Auto-trigger connected callback after subscription
          setTimeout(() => {
            if (callbacks.connected) {
              callbacks.connected()
            }
          }, 0)
          
          return subscription
        }),
        // Helper to get subscription for testing
        _getSubscription: (channelName) => {
          return subscriptions.get(JSON.stringify(channelName))
        },
        _getAllSubscriptions: () => Array.from(subscriptions.values()),
      },
      // Consumer connection state for testing
      _connected: true,
      _connect: jest.fn(),
      _disconnect: jest.fn(),
    }
    
    // Store consumer instance for test access
    global._mockActionCableConsumer = consumer
    
    return consumer
  }),
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

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-v4"),
  v1: jest.fn(() => "mock-uuid-v1"),
}))

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

// Enhanced localStorage mock for context testing
const createMockStorage = () => {
  const store = new Map()
  
  return {
    getItem: jest.fn((key) => store.get(key) || null),
    setItem: jest.fn((key, value) => {
      store.set(key, String(value))
    }),
    removeItem: jest.fn((key) => {
      store.delete(key)
    }),
    clear: jest.fn(() => {
      store.clear()
    }),
    get length() {
      return store.size
    },
    key: jest.fn((index) => {
      const keys = Array.from(store.keys())
      return keys[index] || null
    }),
    // Helper methods for testing
    _getStore: () => store,
    _reset: () => store.clear(),
  }
}

// Setup enhanced localStorage mock
const mockLocalStorage = createMockStorage()
const mockSessionStorage = createMockStorage()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

// Store references for test access
global._mockLocalStorage = mockLocalStorage
global._mockSessionStorage = mockSessionStorage

// Reset storage between tests
beforeEach(() => {
  mockLocalStorage._reset()
  mockSessionStorage._reset()
  
  // Clear all mock function calls
  jest.clearAllMocks()
})