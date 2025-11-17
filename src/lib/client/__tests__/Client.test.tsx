import Cookies from "js-cookie"
import createClient from "../Client"
import { createConsumer } from "@rails/actioncable"

// Mock dependencies
jest.mock("js-cookie")
jest.mock("@/lib/Api")
jest.mock("@/lib/ApiV2")
jest.mock("@/lib/queryParams")
jest.mock("@rails/actioncable")
jest.mock("@/lib/client/websocketClient")

// Import mocked functions after mocking
import Api from "@/lib/Api"
import ApiV2 from "@/lib/ApiV2"
import { queryParams } from "@/lib/queryParams"
import { consumer } from "@/lib/client/websocketClient"

// Mock all client modules
jest.mock("@/lib/client/authClient")
jest.mock("@/lib/client/characterClient")
jest.mock("@/lib/client/vehicleClient")
jest.mock("@/lib/client/fightClient")
jest.mock("@/lib/client/partyClient")
jest.mock("@/lib/client/campaignClient")
jest.mock("@/lib/client/siteClient")
jest.mock("@/lib/client/factionClient")
jest.mock("@/lib/client/weaponClient")
jest.mock("@/lib/client/schtickClient")
jest.mock("@/lib/client/aiClient")
jest.mock("@/lib/client/editorClient")

const mockCookies = Cookies as jest.Mocked<typeof Cookies>
const mockCreateConsumer = createConsumer as jest.MockedFunction<
  typeof createConsumer
>
const mockConsumerFunction = consumer as jest.MockedFunction<typeof consumer>

describe("createClient", () => {
  // Mock API instances
  const mockApi = {
    cable: jest.fn(() => "ws://localhost:3000/cable"),
  }

  const mockApiV2 = {}

  const mockConsumerInstance = {
    subscriptions: {
      create: jest.fn(),
    },
  }

  const mockAuthClient = {
    getCurrentUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  }

  const mockCharacterClient = {
    getCharacters: jest.fn(),
    createCharacter: jest.fn(),
    updateCharacter: jest.fn(),
  }

  const mockVehicleClient = {
    getVehicles: jest.fn(),
  }

  const mockFightClient = {
    getFights: jest.fn(),
  }

  const mockPartyClient = {
    getParties: jest.fn(),
  }

  const mockCampaignClient = {
    getCampaigns: jest.fn(),
    setCurrentCampaign: jest.fn(),
    getCurrentCampaign: jest.fn(),
  }

  const mockSiteClient = {
    getSites: jest.fn(),
  }

  const mockFactionClient = {
    getFactions: jest.fn(),
  }

  const mockWeaponClient = {
    getWeapons: jest.fn(),
  }

  const mockSchtickClient = {
    getSchticks: jest.fn(),
  }

  const mockAiClient = {
    generateCharacter: jest.fn(),
  }

  const mockEditorClient = {
    updateContent: jest.fn(),
  }

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }

  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock window.localStorage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    })

    // Mock API constructors
    ;(Api as jest.MockedClass<typeof Api>).mockImplementation(
      () => mockApi as unknown as Api
    )
    ;(ApiV2 as jest.MockedClass<typeof ApiV2>).mockImplementation(
      () => mockApiV2 as unknown as ApiV2
    )

    // Mock queryParams
    ;(
      queryParams as jest.MockedFunction<typeof queryParams>
    ).mockImplementation(params => params)

    // Mock createConsumer
    mockCreateConsumer.mockReturnValue(mockConsumerInstance as unknown)
    mockConsumerFunction.mockReturnValue(mockConsumerInstance as unknown)

    // Mock all client creation functions
    const authModule = require("@/lib/client/authClient")
    authModule.createAuthClient = jest.fn(() => mockAuthClient)

    const characterModule = require("@/lib/client/characterClient")
    characterModule.createCharacterClient = jest.fn(() => mockCharacterClient)

    const vehicleModule = require("@/lib/client/vehicleClient")
    vehicleModule.createVehicleClient = jest.fn(() => mockVehicleClient)

    const fightModule = require("@/lib/client/fightClient")
    fightModule.createFightClient = jest.fn(() => mockFightClient)

    const partyModule = require("@/lib/client/partyClient")
    partyModule.createPartyClient = jest.fn(() => mockPartyClient)

    const campaignModule = require("@/lib/client/campaignClient")
    campaignModule.createCampaignClient = jest.fn(() => mockCampaignClient)

    const siteModule = require("@/lib/client/siteClient")
    siteModule.createSiteClient = jest.fn(() => mockSiteClient)

    const factionModule = require("@/lib/client/factionClient")
    factionModule.createFactionClient = jest.fn(() => mockFactionClient)

    const weaponModule = require("@/lib/client/weaponClient")
    weaponModule.createWeaponClient = jest.fn(() => mockWeaponClient)

    const schtickModule = require("@/lib/client/schtickClient")
    schtickModule.createSchtickClient = jest.fn(() => mockSchtickClient)

    const aiModule = require("@/lib/client/aiClient")
    aiModule.createAiClient = jest.fn(() => mockAiClient)

    const editorModule = require("@/lib/client/editorClient")
    editorModule.createEditorClient = jest.fn(() => mockEditorClient)

    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe("JWT token resolution", () => {
    it("uses JWT from parameters when provided", () => {
      const jwt = "param-jwt-token"
      const client = createClient({ jwt })

      expect(client.jwt).toBe(jwt)
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled()
      expect(mockCookies.get).not.toHaveBeenCalled()
    })

    it("falls back to localStorage when no JWT in parameters", () => {
      const jwt = "localStorage-jwt-token"
      mockLocalStorage.getItem.mockReturnValue(jwt)

      const client = createClient({})

      expect(client.jwt).toBe(jwt)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("jwtToken")
    })

    it("falls back to cookies when no JWT in parameters or localStorage", () => {
      const jwt = "cookie-jwt-token"
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue(jwt)

      const client = createClient({})

      expect(client.jwt).toBe(jwt)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("jwtToken")
      expect(mockCookies.get).toHaveBeenCalledWith("jwtToken")
    })

    it("warns when no JWT found anywhere", () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue(undefined)

      const client = createClient({})

      expect(client.jwt).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "No JWT provided or found in localStorage/cookies"
      )
    })

    it("handles server-side rendering (no window)", () => {
      // Mock window as undefined to simulate SSR
      const originalWindow = global.window
      delete (global as unknown).window

      const jwt = "param-jwt-token"
      const client = createClient({ jwt })

      expect(client.jwt).toBe(jwt)
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled()

      // Restore window
      global.window = originalWindow
    })
  })

  describe("API instance creation", () => {
    it("creates Api and ApiV2 instances", () => {
      createClient()

      expect(Api).toHaveBeenCalledTimes(1)
      expect(ApiV2).toHaveBeenCalledTimes(1)
    })

    it("includes api and apiV2 in returned client", () => {
      const client = createClient()

      expect(client.api).toBe(mockApi)
      expect(client.apiV2).toBe(mockApiV2)
    })
  })

  describe("WebSocket consumer creation", () => {
    it("creates WebSocket consumer with JWT", () => {
      const jwt = "websocket-jwt-token"

      const client = createClient({ jwt })

      expect(mockConsumerFunction).toHaveBeenCalledWith({ jwt, api: mockApi })
      expect(client.consumer()).toBe(mockConsumerInstance)
    })

    it("creates consumer with no JWT", () => {
      const client = createClient()

      expect(mockConsumerFunction).toHaveBeenCalledWith({
        jwt: undefined,
        api: mockApi,
      })
    })

    it("returns consumer as function", () => {
      const client = createClient()

      expect(typeof client.consumer).toBe("function")
      expect(client.consumer()).toBe(mockConsumerInstance)
    })
  })

  describe("client aggregation", () => {
    const jwt = "test-jwt-token"
    const commonDeps = {
      jwt,
      api: mockApi,
      apiV2: mockApiV2,
      queryParams: queryParams as jest.MockedFunction<typeof queryParams>,
    }

    it("creates all client modules with correct dependencies", () => {
      createClient({ jwt })

      const authModule = require("@/lib/client/authClient")
      expect(authModule.createAuthClient).toHaveBeenCalledWith(commonDeps)

      const characterModule = require("@/lib/client/characterClient")
      expect(characterModule.createCharacterClient).toHaveBeenCalledWith(
        commonDeps
      )

      const vehicleModule = require("@/lib/client/vehicleClient")
      expect(vehicleModule.createVehicleClient).toHaveBeenCalledWith(commonDeps)

      const fightModule = require("@/lib/client/fightClient")
      expect(fightModule.createFightClient).toHaveBeenCalledWith(commonDeps)

      const partyModule = require("@/lib/client/partyClient")
      expect(partyModule.createPartyClient).toHaveBeenCalledWith(commonDeps)

      const campaignModule = require("@/lib/client/campaignClient")
      expect(campaignModule.createCampaignClient).toHaveBeenCalledWith(
        commonDeps
      )

      const siteModule = require("@/lib/client/siteClient")
      expect(siteModule.createSiteClient).toHaveBeenCalledWith(commonDeps)

      const factionModule = require("@/lib/client/factionClient")
      expect(factionModule.createFactionClient).toHaveBeenCalledWith(commonDeps)

      const weaponModule = require("@/lib/client/weaponClient")
      expect(weaponModule.createWeaponClient).toHaveBeenCalledWith(commonDeps)

      const schtickModule = require("@/lib/client/schtickClient")
      expect(schtickModule.createSchtickClient).toHaveBeenCalledWith(commonDeps)
    })

    it("creates AI client without queryParams", () => {
      createClient({ jwt })

      const aiModule = require("@/lib/client/aiClient")
      expect(aiModule.createAiClient).toHaveBeenCalledWith({
        jwt,
        api: mockApi,
        apiV2: mockApiV2,
      })
    })

    it("aggregates all client methods", () => {
      const client = createClient({ jwt })

      // Auth client methods
      expect(client.getCurrentUser).toBe(mockAuthClient.getCurrentUser)
      expect(client.createUser).toBe(mockAuthClient.createUser)
      expect(client.updateUser).toBe(mockAuthClient.updateUser)

      // Character client methods
      expect(client.getCharacters).toBe(mockCharacterClient.getCharacters)
      expect(client.createCharacter).toBe(mockCharacterClient.createCharacter)
      expect(client.updateCharacter).toBe(mockCharacterClient.updateCharacter)

      // Vehicle client methods
      expect(client.getVehicles).toBe(mockVehicleClient.getVehicles)

      // Fight client methods
      expect(client.getFights).toBe(mockFightClient.getFights)

      // Party client methods
      expect(client.getParties).toBe(mockPartyClient.getParties)

      // Campaign client methods
      expect(client.getCampaigns).toBe(mockCampaignClient.getCampaigns)
      expect(client.setCurrentCampaign).toBe(
        mockCampaignClient.setCurrentCampaign
      )
      expect(client.getCurrentCampaign).toBe(
        mockCampaignClient.getCurrentCampaign
      )

      // Site client methods
      expect(client.getSites).toBe(mockSiteClient.getSites)

      // Faction client methods
      expect(client.getFactions).toBe(mockFactionClient.getFactions)

      // Weapon client methods
      expect(client.getWeapons).toBe(mockWeaponClient.getWeapons)

      // Schtick client methods
      expect(client.getSchticks).toBe(mockSchtickClient.getSchticks)

      // AI client methods
      expect(client.generateCharacter).toBe(mockAiClient.generateCharacter)

      // Editor client methods
      expect(client.updateContent).toBe(mockEditorClient.updateContent)
    })
  })

  describe("client structure", () => {
    it("returns object with expected core properties", () => {
      const jwt = "test-jwt"
      const client = createClient({ jwt })

      // Client now includes all methods from individual clients spread onto it
      expect(client.jwt).toBe(jwt)
      expect(client.api).toBe(mockApi)
      expect(client.apiV2).toBe(mockApiV2)
      expect(client.consumer).toEqual(expect.any(Function))

      // Verify it has methods from various clients (but don't check exact structure)
      expect(typeof client.getCharacters).toBe("function")
      expect(typeof client.getCampaigns).toBe("function")
    })

    it("includes methods from all client modules", () => {
      const client = createClient()

      // Should have auth methods
      expect(client.getCurrentUser).toBeDefined()
      expect(client.createUser).toBeDefined()

      // Should have character methods
      expect(client.getCharacters).toBeDefined()
      expect(client.createCharacter).toBeDefined()

      // Should have campaign methods
      expect(client.getCampaigns).toBeDefined()
      expect(client.setCurrentCampaign).toBeDefined()

      // Should have AI methods
      expect(client.generateCharacter).toBeDefined()
    })
  })

  describe("empty parameters", () => {
    it("works with no parameters", () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue(undefined)

      const client = createClient()

      expect(client.jwt).toBeUndefined()
      expect(client.api).toBeDefined()
      expect(client.apiV2).toBeDefined()
      expect(client.consumer).toBeDefined()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "No JWT provided or found in localStorage/cookies"
      )
    })

    it("works with empty object", () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue(undefined)

      const client = createClient({})

      expect(client.jwt).toBeUndefined()
      expect(client.api).toBeDefined()
      expect(client.apiV2).toBeDefined()
      expect(client.consumer).toBeDefined()
    })
  })

  describe("real-world scenarios", () => {
    it("handles typical authenticated scenario", () => {
      const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      mockLocalStorage.getItem.mockReturnValue(jwt)

      const client = createClient()

      expect(client.jwt).toBe(jwt)
      expect(client.getCurrentUser).toBeDefined()
      expect(client.consumer).toBeDefined()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it("handles unauthenticated scenario", () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue(undefined)

      const client = createClient()

      expect(client.jwt).toBeUndefined()
      expect(client.getCurrentUser).toBeDefined() // Methods still exist
      expect(client.consumer).toBeDefined()
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it("handles token from different sources", () => {
      // First try: token in parameters
      let client = createClient({ jwt: "param-token" })
      expect(client.jwt).toBe("param-token")

      jest.clearAllMocks()

      // Second try: token in localStorage
      mockLocalStorage.getItem.mockReturnValue("localStorage-token")
      client = createClient({})
      expect(client.jwt).toBe("localStorage-token")

      jest.clearAllMocks()

      // Third try: token in cookies
      mockLocalStorage.getItem.mockReturnValue(null)
      mockCookies.get.mockReturnValue("cookie-token")
      client = createClient({})
      expect(client.jwt).toBe("cookie-token")
    })
  })
})
