import CharacterService from "@/services/CharacterService"
import type { Person } from "@/types"
import { brick, carolina, shing, zombies } from "@/__tests__/factories/Characters"

// Alias for convenience
const CS = CharacterService

describe("CharacterService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

    it("handles empty chain operations", () => {
      const result = CS.chain(brick, [])
      expect(result).toEqual(brick)
    })

    it("handles single chain operation", () => {
      const result = CS.chain(carolina, [
        ["updateActionValue", ["Wounds", 5]]
      ])

      expect(result.action_values.Wounds).toBe(5)
      expect(result.action_values.Driving).toBe(carolina.action_values.Driving) // Unchanged
    })

    it("maintains immutability during chain operations", () => {
      const original = { ...brick }
      const result = CS.chain(brick, [
        ["updateActionValue", ["Toughness", 99]]
      ])

      expect(result.action_values.Toughness).toBe(99)
      expect(brick.action_values.Toughness).toBe(original.action_values.Toughness) // Original unchanged
      expect(result).not.toBe(brick) // Different object references
    })

    it("handles complex multi-step chains", () => {
      const result = CS.chain(brick, [
        ["updateActionValue", ["Wounds", 10]],
        ["updateActionValue", ["Fortune", 2]],
        ["updateActionValue", ["Toughness", 8]],
        ["updateActionValue", ["Martial Arts", 15]]
      ])

      expect(result.action_values.Wounds).toBe(10)
      expect(result.action_values.Fortune).toBe(2)
      expect(result.action_values.Toughness).toBe(8)
      expect(result.action_values["Martial Arts"]).toBe(15)
    })
  })

  describe("edge cases", () => {
    describe("skill function edge cases", () => {
      it("handles character without action_values", () => {
        const invalidCharacter = { ...carolina, action_values: undefined }
        const result = CS.skill(invalidCharacter as any, "Driving")
        expect(result).toBe(13) // Carolina has Driving: 13 in skills, which skill() checks
      })

      it("handles null skill name", () => {
        const result = CS.skill(carolina, null as any)
        expect(result).toBe(7) // Should return default
      })

      it("handles undefined skill name", () => {
        const result = CS.skill(carolina, undefined as any)
        expect(result).toBe(7) // Should return default
      })

      it("handles empty string skill name", () => {
        const result = CS.skill(carolina, "")
        expect(result).toBe(7) // Should return default
      })

      it("handles skill with zero value", () => {
        const characterWithZeroSkill = {
          ...carolina,
          skills: {
            ...carolina.skills,
            "Zero Skill": 0
          }
        }
        const result = CS.skill(characterWithZeroSkill, "Zero Skill")
        expect(result).toBe(7) // Zero is falsy, so returns default 7
      })

      it("handles skill with negative value", () => {
        const characterWithNegativeSkill = {
          ...carolina,
          skills: {
            ...carolina.skills,
            "Negative Skill": -5
          }
        }
        const result = CS.skill(characterWithNegativeSkill, "Negative Skill")
        expect(result).toBe(-5) // Negative numbers are truthy, so returns actual value
      })
    })

    describe("type checking edge cases", () => {
      it("handles character without type property", () => {
        const characterWithoutType = { 
          ...brick,
          action_values: {
            ...brick.action_values,
            Type: undefined as any
          }
        }
        
        expect(CS.isPC(characterWithoutType)).toBe(false)
        expect(CS.isBoss(characterWithoutType)).toBe(false)
        expect(CS.isMook(characterWithoutType)).toBe(false)
      })

      it("handles character with null type", () => {
        const characterWithNullType = { 
          ...brick,
          action_values: {
            ...brick.action_values,
            Type: null as any
          }
        }
        
        expect(CS.isPC(characterWithNullType)).toBe(false)
        expect(CS.isBoss(characterWithNullType)).toBe(false)
        expect(CS.isMook(characterWithNullType)).toBe(false)
      })

      it("handles character with invalid type", () => {
        const characterWithInvalidType = { 
          ...brick,
          action_values: {
            ...brick.action_values,
            Type: "invalid_type" as any
          }
        }
        
        expect(CS.isPC(characterWithInvalidType)).toBe(false)
        expect(CS.isBoss(characterWithInvalidType)).toBe(false)
        expect(CS.isMook(characterWithInvalidType)).toBe(false)
      })

      it("handles all valid character types correctly", () => {
        const characterTypes = [
          { type: "PC" as const, expectedPC: true, expectedBoss: false, expectedMook: false },
          { type: "Boss" as const, expectedPC: false, expectedBoss: true, expectedMook: false },
          { type: "Uber-Boss" as const, expectedPC: false, expectedBoss: false, expectedMook: false },
          { type: "Featured Foe" as const, expectedPC: false, expectedBoss: false, expectedMook: false },
          { type: "Mook" as const, expectedPC: false, expectedBoss: false, expectedMook: true },
          { type: "Ally" as const, expectedPC: false, expectedBoss: false, expectedMook: false },
        ]

        characterTypes.forEach(({ type, expectedPC, expectedBoss, expectedMook }) => {
          const character = { 
            ...brick,
            action_values: {
              ...brick.action_values,
              Type: type
            }
          }
          
          expect(CS.isPC(character)).toBe(expectedPC)
          expect(CS.isBoss(character)).toBe(expectedBoss)
          expect(CS.isMook(character)).toBe(expectedMook)
        })
      })
    })

    describe("fullHeal edge cases", () => {
      it("handles character without action_values", () => {
        const invalidCharacter = { ...brick }
        delete (invalidCharacter as any).action_values
        
        // fullHeal tries to access action_values.Max Fortune which will throw an error
        expect(() => CS.fullHeal(invalidCharacter as any)).toThrow()
      })

      it("handles character with missing specific action values", () => {
        const partialCharacter = {
          ...brick,
          action_values: {
            Toughness: 8,
            // Missing Wounds, Fortune, Marks of Death
          }
        }
        
        const result = CS.fullHeal(partialCharacter)
        
        // Should handle missing values gracefully
        expect(result.action_values.Toughness).toBe(8) // Unchanged
        expect(result.impairments).toBe(0) // Should be healed
      })

      it("handles character with undefined impairments", () => {
        const characterWithoutImpairments = { ...brick }
        delete (characterWithoutImpairments as any).impairments
        
        const result = CS.fullHeal(characterWithoutImpairments as any)
        expect(result.impairments).toBe(0) // Should set to 0
      })

      it("handles character with null action values", () => {
        const characterWithNullValues = {
          ...brick,
          action_values: {
            ...brick.action_values,
            Wounds: null as any,
            Fortune: null as any,
            "Marks of Death": null as any
          }
        }
        
        const result = CS.fullHeal(characterWithNullValues)
        
        // Should handle null values gracefully
        expect(result.action_values.Wounds).toBe(0)
        expect(result.action_values.Fortune).toBe(5) // Max Fortune
        expect(result.action_values["Marks of Death"]).toBe(0)
      })

      it("handles already fully healed character", () => {
        const healthyCharacter = {
          ...brick,
          action_values: {
            ...brick.action_values,
            Wounds: 0,
            Fortune: 5,
            "Marks of Death": 0
          },
          impairments: 0
        }
        
        const result = CS.fullHeal(healthyCharacter)
        
        // Should maintain the same values
        expect(result.action_values.Wounds).toBe(0)
        expect(result.action_values.Fortune).toBe(5)
        expect(result.action_values["Marks of Death"]).toBe(0)
        expect(result.impairments).toBe(0)
      })
    })

    describe("mainAttack edge cases", () => {
      it("handles character without action_values", () => {
        const invalidCharacter = { ...carolina }
        delete (invalidCharacter as any).action_values
        
        const result = CS.mainAttack(invalidCharacter as any)
        expect(result).toBe("") // otherActionValue returns empty string on error
      })

      it("handles character with equal Guns and Martial Arts", () => {
        const equalSkillsCharacter = {
          ...carolina,
          action_values: {
            ...carolina.action_values,
            Guns: 10,
            "Martial Arts": 10
          }
        }
        
        const result = CS.mainAttack(equalSkillsCharacter)
        expect(["Guns", "Martial Arts"]).toContain(result) // Should return one of them
      })

      it("handles character with missing attack skills", () => {
        const noAttackCharacter = {
          ...carolina,
          action_values: {
            Driving: 13,
            Toughness: 8,
            // No Guns or Martial Arts
          }
        }
        
        const result = CS.mainAttack(noAttackCharacter)
        expect(result).toBe("") // When MainAttack is undefined, returns empty string
      })

      it("handles character with zero attack skills", () => {
        const zeroAttackCharacter = {
          ...carolina,
          action_values: {
            ...carolina.action_values,
            Guns: 0,
            "Martial Arts": 0
          }
        }
        
        const result = CS.mainAttack(zeroAttackCharacter)
        expect(result).toBe("Guns") // Should still return Guns as default
      })
    })

    describe("chain error handling", () => {
      it("handles non-existent function in chain", () => {
        // This should throw or handle gracefully depending on implementation
        expect(() => {
          CS.chain(brick, [
            ["nonExistentFunction", []]
          ])
        }).toThrow() // Or handle gracefully if implementation allows
      })

      it("handles malformed chain arguments", () => {
        const result = CS.chain(brick, [
          ["updateActionValue", []] // Missing required arguments
        ] as any)
        
        // Should handle gracefully without crashing
        expect(result).toBeDefined()
      })

      it("handles null character in chain", () => {
        expect(() => {
          CS.chain(null as any, [
            ["updateActionValue", ["Toughness", 9]]
          ])
        }).toThrow() // Should handle null character appropriately
      })
    })
  })
})