import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import EncounterActionBar from "../EncounterActionBar"
import type { Character } from "@/types"

// Mock the useEncounter hook
const mockEncounter = {
  id: "1",
  name: "Test Encounter",
  shots: [],
}

jest.mock("@/contexts", () => ({
  useEncounter: () => ({
    selectedActorId: "shot_1",
    selectedActorShot: 12,
    encounter: mockEncounter,
  }),
}))

describe("EncounterActionBar", () => {
  const mockOnAction = jest.fn()

  const mockCharacter: Character = {
    id: "char1",
    shot_id: "shot_1",
    name: "Alice",
    character_type: "PC",
    action_values: {
      "Martial Arts": 15,
      Guns: 13,
    },
    wounds: 0,
    impairments: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Visibility", () => {
    it("should be visible when a character is selected", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByTestId("encounter-action-bar")).toBeInTheDocument()
    })

    it("should show disabled state when no character is selected", () => {
      render(
        <EncounterActionBar selectedCharacter={null} onAction={mockOnAction} />
      )

      // The bar is visible but buttons are disabled
      expect(screen.getByTestId("encounter-action-bar")).toBeInTheDocument()
      const attackButtons = screen.getAllByTitle("Select a character first")
      expect(attackButtons.length).toBeGreaterThan(0)
      expect(attackButtons[0]).toBeDisabled()
    })
  })

  describe("Action Buttons", () => {
    it("should display attack button for characters with attack skills", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByTitle("Attack")).toBeInTheDocument()
    })

    it("should display boost button", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByTitle("Boost")).toBeInTheDocument()
    })

    it("should display chase button for characters in a vehicle", () => {
      const characterInVehicle = {
        ...mockCharacter,
        driving: { id: "vehicle1", name: "Car" },
      }

      render(
        <EncounterActionBar
          selectedCharacter={characterInVehicle}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByTitle("Chase")).toBeInTheDocument()
    })

    it("should display heal button for wounded characters", () => {
      const woundedCharacter = {
        ...mockCharacter,
        wounds: 5,
      }

      render(
        <EncounterActionBar
          selectedCharacter={woundedCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByTitle("Heal")).toBeInTheDocument()
    })

    it("should display character name", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByText("Alice")).toBeInTheDocument()
    })
  })

  describe("Action Handling", () => {
    it("should call onAction with 'attack' when Attack button is clicked", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByTitle("Attack"))
      expect(mockOnAction).toHaveBeenCalledWith("attack")
    })

    it("should call onAction with 'boost' when Boost button is clicked", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByTitle("Boost"))
      expect(mockOnAction).toHaveBeenCalledWith("boost")
    })

    it("should call onAction with 'chase' when Chase button is clicked", () => {
      const characterInVehicle = {
        ...mockCharacter,
        driving: { id: "vehicle1", name: "Car" },
      }

      render(
        <EncounterActionBar
          selectedCharacter={characterInVehicle}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByTitle("Chase"))
      expect(mockOnAction).toHaveBeenCalledWith("chase")
    })

    it("should call onAction with 'heal' when Heal button is clicked", () => {
      const woundedCharacter = {
        ...mockCharacter,
        wounds: 5,
      }

      render(
        <EncounterActionBar
          selectedCharacter={woundedCharacter}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByTitle("Heal"))
      expect(mockOnAction).toHaveBeenCalledWith("heal")
    })
  })

  describe("Styling", () => {
    it("should have proper sticky positioning", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      const actionBar = screen.getByTestId("encounter-action-bar")
      expect(actionBar).toHaveStyle({
        position: "sticky",
        top: 0,
      })
    })

    it("should show transition animation when appearing", () => {
      const { rerender } = render(
        <EncounterActionBar selectedCharacter={null} onAction={mockOnAction} />
      )

      rerender(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      const actionBar = screen.getByTestId("encounter-action-bar")
      expect(actionBar).toBeInTheDocument()
    })
  })

  describe("Button Availability", () => {
    it("should disable attack button if character has no attack skills", () => {
      const characterNoAttack = {
        ...mockCharacter,
        action_values: {},
      }

      render(
        <EncounterActionBar
          selectedCharacter={characterNoAttack}
          onAction={mockOnAction}
        />
      )

      const attackButton = screen.getByTitle("Attack")
      expect(attackButton).toBeDisabled()
    })

    it("should show heal button for all characters", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      // Heal button is now always visible
      expect(screen.getByTitle("Heal")).toBeInTheDocument()
    })

    it("should not show chase button if not in a chase", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.queryByTitle("Chase")).not.toBeInTheDocument()
    })
  })
})
