import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import EncounterActionBar from "../EncounterActionBar"
import type { Character } from "@/types"

// Mock the useEncounter hook
const mockSetSelectedActor = jest.fn()
const mockEncounter = {
  id: "1",
  name: "Test Encounter",
  shots: [],
}

jest.mock("@/contexts", () => ({
  useEncounter: () => ({
    selectedActorId: "shot_1",
    selectedActorShot: 12,
    setSelectedActor: mockSetSelectedActor,
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
      "Guns": 13,
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

    it("should not be visible when no character is selected", () => {
      render(
        <EncounterActionBar
          selectedCharacter={null}
          onAction={mockOnAction}
        />
      )

      expect(screen.queryByTestId("encounter-action-bar")).not.toBeInTheDocument()
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

      expect(screen.getByText("Attack")).toBeInTheDocument()
    })

    it("should display boost button", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByText("Boost")).toBeInTheDocument()
    })

    it("should display chase button for characters in a vehicle chase", () => {
      const characterInChase = {
        ...mockCharacter,
        chase_points: 10,
      }

      render(
        <EncounterActionBar
          selectedCharacter={characterInChase}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByText("Chase")).toBeInTheDocument()
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

      expect(screen.getByText("Heal")).toBeInTheDocument()
    })

    it("should display character name and shot position", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Shot 12")).toBeInTheDocument()
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

      fireEvent.click(screen.getByText("Attack"))
      expect(mockOnAction).toHaveBeenCalledWith("attack", mockCharacter)
    })

    it("should call onAction with 'boost' when Boost button is clicked", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByText("Boost"))
      expect(mockOnAction).toHaveBeenCalledWith("boost", mockCharacter)
    })

    it("should call onAction with 'chase' when Chase button is clicked", () => {
      const characterInChase = {
        ...mockCharacter,
        chase_points: 10,
      }

      render(
        <EncounterActionBar
          selectedCharacter={characterInChase}
          onAction={mockOnAction}
        />
      )

      fireEvent.click(screen.getByText("Chase"))
      expect(mockOnAction).toHaveBeenCalledWith("chase", characterInChase)
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

      fireEvent.click(screen.getByText("Heal"))
      expect(mockOnAction).toHaveBeenCalledWith("heal", woundedCharacter)
    })

    it("should clear selection when close button is clicked", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      const closeButton = screen.getByLabelText("Clear selection")
      fireEvent.click(closeButton)
      
      expect(mockSetSelectedActor).toHaveBeenCalledWith(null, null)
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
        <EncounterActionBar
          selectedCharacter={null}
          onAction={mockOnAction}
        />
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

      const attackButton = screen.getByText("Attack")
      expect(attackButton).toBeDisabled()
    })

    it("should not show heal button if character has no wounds", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.queryByText("Heal")).not.toBeInTheDocument()
    })

    it("should not show chase button if not in a chase", () => {
      render(
        <EncounterActionBar
          selectedCharacter={mockCharacter}
          onAction={mockOnAction}
        />
      )

      expect(screen.queryByText("Chase")).not.toBeInTheDocument()
    })
  })
})