import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { EncounterProvider, useEncounter } from "../EncounterContext"
import type { Encounter } from "@/types"

// Mock the AppContext
jest.mock("@/contexts/AppContext", () => ({
  useCampaign: () => ({
    campaignData: null,
  }),
  useClient: () => ({
    client: {
      getWeaponsBatch: jest.fn().mockResolvedValue({ data: { weapons: [] } }),
      getSchticksBatch: jest.fn().mockResolvedValue({ data: { schticks: [] } }),
      spendShots: jest.fn().mockResolvedValue({ data: {} }),
    },
  }),
}))

// Mock useEntity hook
jest.mock("@/hooks", () => ({
  useEntity: () => ({
    deleteEntity: jest.fn(),
    updateEntity: jest.fn(),
    handleChangeAndSave: jest.fn(),
  }),
}))

const mockEncounter: Encounter = {
  id: "1",
  name: "Test Encounter",
  description: "Test Description",
  shots: [
    {
      shot: 12,
      characters: [
        {
          id: "char1",
          shot_id: "shot_1",
          name: "Alice",
          character_type: "PC",
          action_values: {},
        },
      ],
    },
    {
      shot: 10,
      characters: [
        {
          id: "char2",
          shot_id: "shot_2",
          name: "Bob",
          character_type: "PC",
          action_values: {},
        },
      ],
    },
  ],
}

// Test component that uses the new selectedActorId functionality
const TestComponent = () => {
  const { selectedActorId, selectedActorShot, setSelectedActor } = useEncounter()

  return (
    <div>
      <div data-testid="selected-actor-id">{selectedActorId || "none"}</div>
      <div data-testid="selected-actor-shot">{selectedActorShot || "none"}</div>
      <button onClick={() => setSelectedActor("shot_1", 12)}>
        Select Alice
      </button>
      <button onClick={() => setSelectedActor("shot_2", 10)}>
        Select Bob
      </button>
      <button onClick={() => setSelectedActor(null, null)}>
        Clear Selection
      </button>
    </div>
  )
}

describe("EncounterContext - Elevated CharacterSelector", () => {
  describe("Selected Actor State", () => {
    it("should initialize with no selected actor", () => {
      render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      expect(screen.getByTestId("selected-actor-id")).toHaveTextContent("none")
      expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent(
        "none"
      )
    })

    it("should allow selecting an actor", async () => {
      render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      fireEvent.click(screen.getByText("Select Alice"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_1"
        )
        expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent(
          "12"
        )
      })
    })

    it("should allow changing selected actor", async () => {
      render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Select Alice first
      fireEvent.click(screen.getByText("Select Alice"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_1"
        )
      })

      // Then select Bob
      fireEvent.click(screen.getByText("Select Bob"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_2"
        )
        expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent(
          "10"
        )
      })
    })

    it("should allow clearing selected actor", async () => {
      render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Select Alice
      fireEvent.click(screen.getByText("Select Alice"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_1"
        )
      })

      // Clear selection
      fireEvent.click(screen.getByText("Clear Selection"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "none"
        )
        expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent(
          "none"
        )
      })
    })

    it("should maintain selected actor across re-renders", async () => {
      const { rerender } = render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Select Alice
      fireEvent.click(screen.getByText("Select Alice"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_1"
        )
      })

      // Re-render with same encounter
      rerender(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Selection should persist
      expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
        "shot_1"
      )
      expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent("12")
    })

    it("should clear selection when encounter changes", async () => {
      const { rerender } = render(
        <EncounterProvider encounter={mockEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Select Alice
      fireEvent.click(screen.getByText("Select Alice"))

      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "shot_1"
        )
      })

      // Change to a different encounter
      const newEncounter = { ...mockEncounter, id: "2" }
      rerender(
        <EncounterProvider encounter={newEncounter}>
          <TestComponent />
        </EncounterProvider>
      )

      // Selection should be cleared
      await waitFor(() => {
        expect(screen.getByTestId("selected-actor-id")).toHaveTextContent(
          "none"
        )
        expect(screen.getByTestId("selected-actor-shot")).toHaveTextContent(
          "none"
        )
      })
    })
  })
})