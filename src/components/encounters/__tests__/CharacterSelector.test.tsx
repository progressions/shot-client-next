import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import CharacterSelector from "../CharacterSelector"
import type { Shot, Character } from "@/types"

// Mock the Avatar component
jest.mock("@/components/avatars", () => ({
  Avatar: ({ entity }: { entity: any }) => (
    <div data-testid={`avatar-${entity.shot_id}`}>{entity.name}</div>
  ),
}))

// Mock CS service
jest.mock("@/services", () => ({
  CS: {
    type: jest.fn((char: Character) => char.character_type),
  },
}))

describe("CharacterSelector", () => {
  const createMockCharacter = (
    id: string,
    name: string,
    shot: number,
    type: string = "PC"
  ): Character => ({
    id,
    shot_id: `shot_${id}`,
    name,
    character_type: type,
    action_values: {},
  } as Character)

  const createMockShot = (character: Character, shot: number): Shot => ({
    shot,
    character,
    characters: [character],
    uniqueIndex: Math.random(),
  })

  describe("Shot Labels", () => {
    it("should display shot labels before each group of characters at the same shot", () => {
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const char2 = createMockCharacter("2", "Bob", 12, "PC")
      const char3 = createMockCharacter("3", "Charlie", 10, "PC")
      const char4 = createMockCharacter("4", "Diana", 8, "PC")

      const shots = [
        createMockShot(char1, 12),
        createMockShot(char2, 12),
        createMockShot(char3, 10),
        createMockShot(char4, 8),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      // Check for shot labels
      expect(screen.getByText("12")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()
      expect(screen.getByText("8")).toBeInTheDocument()
    })

    it("should not display duplicate shot labels for characters on the same shot", () => {
      const char1 = createMockCharacter("1", "Alice", 15, "PC")
      const char2 = createMockCharacter("2", "Bob", 15, "PC")
      const char3 = createMockCharacter("3", "Charlie", 15, "Ally")

      const shots = [
        createMockShot(char1, 15),
        createMockShot(char2, 15),
        createMockShot(char3, 15),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      // Should only have one "15" label
      const shotLabels = screen.getAllByText("15")
      expect(shotLabels).toHaveLength(1)
    })

    it("should display shot labels in descending order", () => {
      const char1 = createMockCharacter("1", "Alice", 20, "PC")
      const char2 = createMockCharacter("2", "Bob", 15, "PC")
      const char3 = createMockCharacter("3", "Charlie", 10, "PC")
      const char4 = createMockCharacter("4", "Diana", 5, "PC")

      const shots = [
        createMockShot(char1, 20),
        createMockShot(char2, 15),
        createMockShot(char3, 10),
        createMockShot(char4, 5),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      const container = screen.getByTestId("character-selector-container")
      const shotLabels = container.querySelectorAll("[data-testid^='shot-label-']")
      
      // Check order is descending
      expect(shotLabels[0]).toHaveTextContent("20")
      expect(shotLabels[1]).toHaveTextContent("15")
      expect(shotLabels[2]).toHaveTextContent("10")
      expect(shotLabels[3]).toHaveTextContent("5")
    })

    it("should update shot labels when characters change positions", () => {
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const char2 = createMockCharacter("2", "Bob", 10, "PC")

      const initialShots = [
        createMockShot(char1, 12),
        createMockShot(char2, 10),
      ]

      const { rerender } = render(
        <CharacterSelector
          shots={initialShots}
          onSelect={jest.fn()}
        />
      )

      expect(screen.getByText("12")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()

      // Update character positions
      const updatedChar1 = { ...char1 }
      const updatedChar2 = { ...char2 }
      const updatedShots = [
        createMockShot(updatedChar1, 15),
        createMockShot(updatedChar2, 8),
      ]

      rerender(
        <CharacterSelector
          shots={updatedShots}
          onSelect={jest.fn()}
        />
      )

      // Old labels should be gone
      expect(screen.queryByText("12")).not.toBeInTheDocument()
      expect(screen.queryByText("10")).not.toBeInTheDocument()

      // New labels should appear
      expect(screen.getByText("15")).toBeInTheDocument()
      expect(screen.getByText("8")).toBeInTheDocument()
    })

    it("should handle shot 0 correctly", () => {
      const char1 = createMockCharacter("1", "Alice", 0, "PC")
      const shots = [createMockShot(char1, 0)]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should handle negative shot values", () => {
      const char1 = createMockCharacter("1", "Alice", -3, "PC")
      const shots = [createMockShot(char1, -3)]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      expect(screen.getByText("-3")).toBeInTheDocument()
    })

    it("should style shot labels differently from character avatars", () => {
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const shots = [createMockShot(char1, 12)]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      const shotLabel = screen.getByTestId("shot-label-12")
      // Check that the shot label has the text "12"
      expect(shotLabel).toHaveTextContent("12")
      // Check that the shot label element exists and is different from avatars
      expect(shotLabel).not.toHaveAttribute("data-testid", expect.stringContaining("avatar"))
    })
  })

  describe("Existing Functionality", () => {
    it("should maintain character selection functionality with shot labels", () => {
      const onSelect = jest.fn()
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const char2 = createMockCharacter("2", "Bob", 10, "PC")

      const shots = [
        createMockShot(char1, 12),
        createMockShot(char2, 10),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={onSelect}
        />
      )

      // Click on character avatar (not the shot label)
      const aliceAvatar = screen.getByTestId("avatar-shot_1").closest(".MuiBox-root")
      fireEvent.click(aliceAvatar!)

      expect(onSelect).toHaveBeenCalledWith("shot_1")
    })

    it("should not interfere with character type filtering", () => {
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const char2 = createMockCharacter("2", "Bob", 12, "Mook")
      const char3 = createMockCharacter("3", "Charlie", 10, "PC")

      const shots = [
        createMockShot(char1, 12),
        createMockShot(char2, 12),
        createMockShot(char3, 10),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
          characterTypes={["PC"]}
        />
      )

      // Should show shot labels for shots that have visible characters
      expect(screen.getByText("12")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()

      // PC characters should be visible
      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()

      // Mook should be filtered out
      expect(screen.queryByText("Bob")).not.toBeInTheDocument()
    })

    it("should work with multi-select mode", () => {
      const onSelect = jest.fn()
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const char2 = createMockCharacter("2", "Bob", 12, "PC")

      const shots = [
        createMockShot(char1, 12),
        createMockShot(char2, 12),
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={onSelect}
          multiSelect={true}
          selectedShotIds={["shot_1"]}
        />
      )

      expect(screen.getByText("12")).toBeInTheDocument()
      
      // Click second character
      const bobAvatar = screen.getByTestId("avatar-shot_2").closest(".MuiBox-root")
      fireEvent.click(bobAvatar!)

      expect(onSelect).toHaveBeenCalledWith("shot_2")
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty shots array", () => {
      render(
        <CharacterSelector
          shots={[]}
          onSelect={jest.fn()}
        />
      )

      // Should render without crashing
      const container = screen.getByTestId("character-selector-container")
      expect(container).toBeInTheDocument()
    })

    it("should handle shots with null characters", () => {
      const shots = [
        { shot: 12, character: null, characters: [], uniqueIndex: 1 } as Shot,
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      // Should not display shot label for empty shot
      expect(screen.queryByText("Shot 12")).not.toBeInTheDocument()
    })

    it("should handle mixed shot values including null and undefined", () => {
      const char1 = createMockCharacter("1", "Alice", 12, "PC")
      const shots = [
        createMockShot(char1, 12),
        { shot: null, character: createMockCharacter("2", "Bob", 0, "PC"), characters: [], uniqueIndex: 2 } as any,
        { shot: undefined, character: createMockCharacter("3", "Charlie", 0, "PC"), characters: [], uniqueIndex: 3 } as any,
      ]

      render(
        <CharacterSelector
          shots={shots}
          onSelect={jest.fn()}
        />
      )

      // Should only show label for valid shot
      expect(screen.getByText("12")).toBeInTheDocument()
      expect(screen.queryByText("null")).not.toBeInTheDocument()
      expect(screen.queryByText("undefined")).not.toBeInTheDocument()
    })
  })
})