import React from "react"
import { render, screen } from "@testing-library/react"
import { EntityAtAGlanceToggle } from "./EntityAtAGlanceToggle"

const mockHandleChangeAndSave = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useClient: () => ({
    user: mockUser,
    client: {},
  }),
  useCampaign: () => ({
    campaign: mockCampaign,
  }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

let mockUser = { id: "1", admin: true, gamemaster: false }
let mockCampaign = { id: "campaign1", gamemaster_id: "1" }

describe("EntityAtAGlanceToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: "1", admin: true, gamemaster: false }
    mockCampaign = { id: "campaign1", gamemaster_id: "1" }
  })

  it("syncs when at_a_glance changes on the entity", () => {
    const { rerender } = render(
      <EntityAtAGlanceToggle
        entity={{ id: "123", entity_class: "Character", at_a_glance: false }}
        handleChangeAndSave={mockHandleChangeAndSave}
      />
    )

    const toggle = screen.getByRole("switch")
    expect(toggle).not.toBeChecked()

    rerender(
      <EntityAtAGlanceToggle
        entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
        handleChangeAndSave={mockHandleChangeAndSave}
      />
    )

    const updatedToggle = screen.getByRole("switch")
    expect(updatedToggle).toBeChecked()
  })
})
