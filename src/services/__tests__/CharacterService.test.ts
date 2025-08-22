import CharacterService from "@/services/CharacterService"
import type { Person } from "@/types"
import { brick, carolina, shing, zombies } from "@/__tests__/factories/Characters"

// Alias for convenience
const CS = CharacterService

describe("CharacterService", () => {
  describe("skill", () => {
    it("should return a character's skill", () => {
      const character = carolina

      expect(CS.skill(character, "Driving")).toBe(13)
    })

    it("should return a character's skill without a modifier", () => {
      const character: Person = {
        ...carolina,
        impairments: 1
      }
      expect(CS.skill(character, "Driving")).toBe(13)
    })

    it("returns 7 if the character does not have the skill", () => {
      expect(CS.skill(carolina, "Fix-It")).toBe(7)
    })
  })

  describe("mainAttack", () => {
    it("should return a default character's main attack", () => {
      const character = carolina

      expect(CS.mainAttack(character)).toBe("Guns")
    })

    it("returns a martial artist's main attack", () => {
      const character = brick

      expect(CS.mainAttack(character)).toBe("Martial Arts")
    })
  })

  describe("type checking", () => {
    it("should identify PC characters", () => {
      expect(CS.isPC(brick)).toBe(true)
      expect(CS.isPC(carolina)).toBe(true)
      expect(CS.isPC(shing)).toBe(false)
    })

    it("should identify Boss characters", () => {
      expect(CS.isBoss(shing)).toBe(true)
      expect(CS.isBoss(brick)).toBe(false)
    })

    it("should identify Mook characters", () => {
      expect(CS.isMook(zombies)).toBe(true)
      expect(CS.isMook(brick)).toBe(false)
    })
  })

  describe("fullHeal", () => {
    it("should restore a character to full health", () => {
      const woundedCharacter: Person = {
        ...brick,
        action_values: {
          ...brick.action_values,
          Wounds: 20,
          Fortune: 2,
          "Marks of Death": 1
        },
        impairments: 2
      }

      const healedCharacter = CS.fullHeal(woundedCharacter)

      expect(healedCharacter.action_values.Wounds).toBe(0)
      expect(healedCharacter.action_values.Fortune).toBe(5) // Max Fortune
      expect(healedCharacter.action_values["Marks of Death"]).toBe(0)
      expect(healedCharacter.impairments).toBe(0)
    })

    it("should not heal mook characters", () => {
      const woundedMook: Person = {
        ...zombies,
        action_values: {
          ...zombies.action_values,
          Wounds: 5
        }
      }

      const result = CS.fullHeal(woundedMook)
      expect(result).toEqual(woundedMook)
    })
  })

  describe("chain operations", () => {
    it("should execute a chain of operations", () => {
      const result = CS.chain(brick, [
        ["updateActionValue", ["Toughness", 9]],
        ["updateActionValue", ["Fortune", 3]]
      ])

      expect(result.action_values.Toughness).toBe(9)
      expect(result.action_values.Fortune).toBe(3)
    })
  })
})