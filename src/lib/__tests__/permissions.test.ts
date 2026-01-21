import { isPlayerForCampaign, hasGmAccess } from "../permissions"
import type { User, Campaign } from "@/types"

// Minimal mock objects for testing
const createUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    image_url: "",
    entity_class: "User",
    admin: false,
    gamemaster: false,
    ...overrides,
  }) as User

const createCampaign = (overrides: Partial<Campaign> = {}): Campaign =>
  ({
    id: "campaign-123",
    name: "Test Campaign",
    gamemaster_id: "gm-user-123",
    description: "",
    gamemaster: {} as User,
    players: [],
    player_ids: [],
    invitations: [],
    image_url: "",
    created_at: "",
    updated_at: "",
    entity_class: "Campaign",
    ...overrides,
  }) as Campaign

describe("isPlayerForCampaign", () => {
  it("returns true when user is null", () => {
    expect(isPlayerForCampaign(null)).toBe(true)
  })

  it("returns true when user is undefined", () => {
    expect(isPlayerForCampaign(undefined)).toBe(true)
  })

  it("returns false when user is admin", () => {
    const adminUser = createUser({ admin: true })
    expect(isPlayerForCampaign(adminUser)).toBe(false)
  })

  it("returns false when user is the campaign gamemaster", () => {
    const user = createUser({ id: "gm-user-123" })
    const campaign = createCampaign({ gamemaster_id: "gm-user-123" })
    expect(isPlayerForCampaign(user, campaign)).toBe(false)
  })

  it("returns true for regular player in campaign", () => {
    const player = createUser({ id: "player-456" })
    const campaign = createCampaign({ gamemaster_id: "gm-user-123" })
    expect(isPlayerForCampaign(player, campaign)).toBe(true)
  })

  it("returns true when no campaign context is provided", () => {
    const player = createUser({ id: "player-456" })
    expect(isPlayerForCampaign(player)).toBe(true)
  })

  it("returns true when campaign is null", () => {
    const player = createUser({ id: "player-456" })
    expect(isPlayerForCampaign(player, null)).toBe(true)
  })

  it("admin has access even without campaign context", () => {
    const adminUser = createUser({ admin: true })
    expect(isPlayerForCampaign(adminUser, null)).toBe(false)
  })

  it("does not use global gamemaster flag for permissions", () => {
    // User has gamemaster flag but is NOT the campaign's GM
    const user = createUser({ id: "other-gm", gamemaster: true })
    const campaign = createCampaign({ gamemaster_id: "campaign-owner" })
    // Should be treated as player since they're not THIS campaign's GM
    expect(isPlayerForCampaign(user, campaign)).toBe(true)
  })
})

describe("hasGmAccess", () => {
  it("returns false when user is null", () => {
    expect(hasGmAccess(null)).toBe(false)
  })

  it("returns true when user is admin", () => {
    const adminUser = createUser({ admin: true })
    expect(hasGmAccess(adminUser)).toBe(true)
  })

  it("returns true when user is the campaign gamemaster", () => {
    const user = createUser({ id: "gm-user-123" })
    const campaign = createCampaign({ gamemaster_id: "gm-user-123" })
    expect(hasGmAccess(user, campaign)).toBe(true)
  })

  it("returns false for regular player", () => {
    const player = createUser({ id: "player-456" })
    const campaign = createCampaign({ gamemaster_id: "gm-user-123" })
    expect(hasGmAccess(player, campaign)).toBe(false)
  })

  it("is the inverse of isPlayerForCampaign", () => {
    const player = createUser({ id: "player-456" })
    const campaign = createCampaign({ gamemaster_id: "gm-user-123" })

    expect(hasGmAccess(player, campaign)).toBe(
      !isPlayerForCampaign(player, campaign)
    )

    const admin = createUser({ admin: true })
    expect(hasGmAccess(admin, campaign)).toBe(
      !isPlayerForCampaign(admin, campaign)
    )
  })
})
