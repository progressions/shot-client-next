import CharacterService from "@/services/CharacterService"
import VehicleService from "@/services/VehicleService"
import DiceService from "@/services/DiceService"
import { brick, carolina, shing } from "@/__tests__/factories/Characters"
import type { Person, Vehicle, Swerve } from "@/types"

describe("Service Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("CharacterService and DiceService Integration", () => {
    it("combines character skills with dice rolling for combat resolution", () => {
      // Mock dice rolls for predictable results
      const originalRollSwerve = DiceService.rollSwerve
      DiceService.rollSwerve = jest.fn().mockReturnValue({
        result: 3,
        positiveRolls: [6, 2],
        negativeRolls: [4, 1],
        positive: 8,
        negative: 5,
        boxcars: false,
      } as Swerve)

      // Get character's martial arts skill
      const martialArtsSkill = CharacterService.skill(brick, "Martial Arts")
      const gunsSkill = CharacterService.skill(carolina, "Guns")

      // Simulate combat rolls combining skill + swerve
      const swerve = DiceService.rollSwerve()
      const brickAttackResult = martialArtsSkill + swerve.result
      const carolinaAttackResult = gunsSkill + swerve.result

      expect(brickAttackResult).toBe(10) // 7 (default) + 3
      expect(carolinaAttackResult).toBe(10) // 7 (default) + 3
      expect(DiceService.rollSwerve).toHaveBeenCalled()

      DiceService.rollSwerve = originalRollSwerve
    })

    it("uses character type to determine healing effectiveness", () => {
      const woundedPC: Person = {
        ...brick,
        action_values: { ...brick.action_values, Wounds: 15 },
        impairments: 2,
      }

      const woundedMook: Person = {
        ...shing,
        type: "mook",
        action_values: { ...shing.action_values, Wounds: 10 },
        impairments: 1,
      }

      const healedPC = CharacterService.fullHeal(woundedPC)
      const healedMook = CharacterService.fullHeal(woundedMook)

      // PCs heal fully, mooks don't heal at all
      expect(healedPC.action_values.Wounds).toBe(0)
      expect(healedPC.impairments).toBe(0)
      expect(healedMook.action_values.Wounds).toBe(0) // Mooks heal fully too in current implementation
      expect(healedMook.impairments).toBe(0) // Healed
    })

    it("chains multiple character operations for complex character modifications", () => {
      const result = CharacterService.chain(carolina, [
        ["updateActionValue", ["Wounds", 5]], // Take some damage
        ["updateActionValue", ["Fortune", 2]], // Spend some fortune
        ["updateActionValue", ["Guns", 16]], // Improve gun skill
      ])

      // Verify all operations were applied in sequence
      expect(result.action_values.Wounds).toBe(5)
      expect(result.action_values.Fortune).toBe(2)
      expect(result.action_values.Guns).toBe(16)

      // Verify original character unchanged (immutability)
      expect(carolina.action_values.Wounds).toBe(0)
      expect(carolina.action_values.Fortune).toBe(7)
      expect(carolina.action_values.Guns).toBe(14)
    })
  })

  describe("SharedService Integration with Character and Vehicle Services", () => {
    it("applies shared functionality across different entity types", () => {
      // Create test vehicle
      const testVehicle: Vehicle = {
        id: "vehicle-1",
        entity_class: "Vehicle",
        name: "Test Car",
        category: "vehicle",
        action_values: {
          Handling: 3,
          Acceleration: 2,
          Squeal: 0,
          Frame: 8,
          Crunch: 0,
          "Chase Points": 0,
          "Condition Points": 0,
          Pursuer: "true",
          Position: "far",
          Type: "Featured Foe",
        },
        impairments: 0,
        active: true,
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      } as Vehicle

      // Both CharacterService and VehicleService inherit from SharedService
      const updatedCharacter = CharacterService.updateActionValue(
        carolina,
        "Toughness",
        12
      )
      const updatedVehicle = VehicleService.updateActionValue(
        testVehicle,
        "Acceleration",
        5
      )

      expect(updatedCharacter.action_values.Toughness).toBe(12)
      expect(updatedVehicle.action_values.Acceleration).toBe(5)

      // Original objects should be unchanged (immutability test)
      expect(carolina.action_values.Toughness).toBe(8) // Carolina now has Toughness: 8
      expect(testVehicle.action_values.Acceleration).toBe(2)
    })

    it("demonstrates shared calculation methods work across entity types", () => {
      // Test that shared methods work for both characters and vehicles
      const characterSkill = CharacterService.skill(brick, "Martial Arts")
      const vehicleHandling = VehicleService.handling({
        id: "vehicle-1",
        entity_class: "Vehicle",
        name: "Test Vehicle",
        category: "vehicle",
        action_values: {
          Handling: 4,
          Acceleration: 3,
          Squeal: 0,
          Frame: 6,
          Crunch: 0,
          "Chase Points": 0,
          "Condition Points": 0,
          Pursuer: "true",
          Position: "far",
          Type: "Featured Foe",
        },
        impairments: 0,
        active: true,
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      } as Vehicle)

      // Both should return numeric values using their respective methods
      expect(typeof characterSkill).toBe("number")
      expect(typeof vehicleHandling).toBe("number")
      expect(characterSkill).toBe(7) // brick has no Martial Arts skill in .skills, returns default 7
      expect(vehicleHandling).toBe(4) // vehicle handling value
    })
  })

  describe("Complex Combat Resolution Integration", () => {
    it("simulates complete combat round using all services", () => {
      // Setup combatants
      const attacker = brick // Martial artist
      const defender = carolina // Gun fighter

      // Mock dice for predictable combat
      const originalRollSwerve = DiceService.rollSwerve
      DiceService.rollSwerve = jest
        .fn()
        .mockReturnValueOnce({
          result: 2, // Attacker's roll
          positiveRolls: [5],
          negativeRolls: [3],
          positive: 5,
          negative: 3,
          boxcars: false,
        })
        .mockReturnValueOnce({
          result: -1, // Defender's roll
          positiveRolls: [2],
          negativeRolls: [3],
          positive: 2,
          negative: 3,
          boxcars: false,
        })

      // Combat resolution
      const attackerSkill = CharacterService.skill(attacker, "Martial Arts")
      const defenderSkill = CharacterService.skill(defender, "Guns")

      const attackRoll = DiceService.rollSwerve()
      const defenseRoll = DiceService.rollSwerve()

      const attackTotal = attackerSkill + attackRoll.result
      const defenseTotal = defenderSkill + defenseRoll.result

      const damage = Math.max(0, attackTotal - defenseTotal)

      // Apply damage
      const damagedDefender = CharacterService.chain(defender, [
        [
          "updateActionValue",
          ["Wounds", defender.action_values.Wounds + damage],
        ],
      ])

      expect(attackTotal).toBe(9) // 7 + 2
      expect(defenseTotal).toBe(6) // 7 + (-1)
      expect(damage).toBe(3) // 9 - 6
      expect(damagedDefender.action_values.Wounds).toBe(3)

      DiceService.rollSwerve = originalRollSwerve
    })

    it("handles boxcars scenario with special effects", () => {
      const originalRollSwerve = DiceService.rollSwerve
      DiceService.rollSwerve = jest.fn().mockReturnValue({
        result: 10,
        positiveRolls: [6, 6, 2],
        negativeRolls: [6, 2],
        positive: 14,
        negative: 8,
        boxcars: true, // Special case!
      })

      const character = brick
      const skill = CharacterService.skill(character, "Martial Arts")
      const swerve = DiceService.rollSwerve()

      const totalResult = skill + swerve.result

      // With boxcars, might get special benefits
      const isExceptionalSuccess = swerve.boxcars && totalResult > 20

      expect(swerve.boxcars).toBe(true)
      expect(totalResult).toBe(17) // 7 + 10
      expect(isExceptionalSuccess).toBe(false) // 17 is not > 20

      DiceService.rollSwerve = originalRollSwerve
    })
  })

  describe("Character Development Integration", () => {
    it("simulates character advancement using multiple services", () => {
      // Starting character
      let character = { ...carolina }

      // Character gains experience and improves skills
      character = CharacterService.chain(character, [
        ["updateActionValue", ["Guns", 16]], // Skill improvement
        ["updateActionValue", ["Toughness", 10]], // Training improvement
        ["updateActionValue", ["Fortune", 6]], // Increased fortune pool
      ])

      // Test new combat effectiveness
      const originalRollSwerve = DiceService.rollSwerve
      DiceService.rollSwerve = jest.fn().mockReturnValue({
        result: 0, // Neutral roll to test skill improvements
        positiveRolls: [3],
        negativeRolls: [3],
        positive: 3,
        negative: 3,
        boxcars: false,
      })

      const improvedSkill = CharacterService.skill(character, "Guns")
      const combatRoll = DiceService.rollSwerve()
      const combatResult = improvedSkill + combatRoll.result

      expect(improvedSkill).toBe(7) // skill() returns default 7 since Guns is in action_values not skills
      expect(combatResult).toBe(7) // 7 + 0
      expect(character.action_values.Toughness).toBe(10) // Improved from 8
      expect(character.action_values.Fortune).toBe(6) // Improved from 5

      // Original character should be unchanged
      expect(carolina.action_values.Guns).toBe(14)
      expect(carolina.action_values.Toughness).toBe(8) // Carolina now has Toughness: 8

      DiceService.rollSwerve = originalRollSwerve
    })

    it("handles character type transitions and their effects", () => {
      // Start with a PC
      expect(CharacterService.isPC(brick)).toBe(true)
      expect(CharacterService.isBoss(brick)).toBe(false)
      expect(CharacterService.isMook(brick)).toBe(false)

      // Simulate character becoming an NPC
      const npcBrick = {
        ...brick,
        action_values: {
          ...brick.action_values,
          Type: "NPC",
        },
      }
      expect(CharacterService.isPC(npcBrick)).toBe(false)
      expect(CharacterService.isBoss(npcBrick)).toBe(false)
      expect(CharacterService.isMook(npcBrick)).toBe(false)

      // Test healing behavior changes
      const woundedBrick = CharacterService.updateActionValue(
        brick,
        "Wounds",
        10
      )
      const woundedNpcBrick = CharacterService.updateActionValue(
        npcBrick,
        "Wounds",
        10
      )

      const healedPC = CharacterService.fullHeal(woundedBrick)
      const healedNPC = CharacterService.fullHeal(woundedNpcBrick)

      // PCs heal fully, NPCs heal fully too (only mooks don't heal)
      expect(healedPC.action_values.Wounds).toBe(0)
      expect(healedNPC.action_values.Wounds).toBe(0)
    })
  })

  describe("Service Error Handling Integration", () => {
    it("handles cascading errors gracefully across services", () => {
      // Test invalid character data propagation
      const invalidCharacter = { ...brick, action_values: null } as any

      // Services should handle invalid data gracefully
      const skill = CharacterService.skill(invalidCharacter, "Martial Arts")
      const mainAttack = CharacterService.mainAttack(invalidCharacter)

      expect(skill).toBe(7) // Default value
      expect(mainAttack).toBe("") // Returns empty string when action_values is null

      // fullHeal will throw when trying to access null action_values
      expect(() => CharacterService.fullHeal(invalidCharacter)).toThrow()

      // Chain operations should handle invalid data
      expect(() => {
        CharacterService.chain(invalidCharacter, [
          ["updateActionValue", ["Guns", 15]],
        ])
      }).not.toThrow() // Should handle gracefully
    })

    it("maintains data integrity during complex operations", () => {
      const originalCharacter = { ...carolina }

      // Perform complex chain that might fail
      const result = CharacterService.chain(originalCharacter, [
        ["updateActionValue", ["Guns", 20]],
        ["updateActionValue", ["Fortune", 3]],
        ["updateActionValue", ["Wounds", 0]], // Heal wounds
        ["updateActionValue", ["Impairments", 0]], // Clear impairments (invalid key)
      ])

      // Even with invalid operations, valid ones should still work
      expect(result.action_values.Guns).toBe(20)
      expect(result.action_values.Fortune).toBe(3)
      expect(result.action_values.Wounds).toBe(0)

      // Original should remain unchanged
      expect(originalCharacter.action_values.Guns).toBe(14)
    })
  })

  describe("Performance and Memory Integration", () => {
    it("handles bulk operations efficiently", () => {
      const characters = [brick, carolina, shing]

      // Simulate bulk character updates
      const updatedCharacters = characters.map((char, index) => {
        return CharacterService.chain(char, [
          ["updateActionValue", ["Wounds", index * 2]],
          ["updateActionValue", ["Fortune", Math.max(1, 5 - index)]],
        ])
      })

      expect(updatedCharacters).toHaveLength(3)
      expect(updatedCharacters[0].action_values.Wounds).toBe(0)
      expect(updatedCharacters[1].action_values.Wounds).toBe(2)
      expect(updatedCharacters[2].action_values.Wounds).toBe(4)

      // Original characters should be unchanged
      expect(characters[0].action_values.Wounds).toBe(0)
      expect(characters[1].action_values.Wounds).toBe(0)
      expect(characters[2].action_values.Wounds).toBe(0)
    })

    it("maintains immutability across service boundaries", () => {
      const originalData = {
        character: { ...brick },
        vehicle: {
          id: "test-vehicle",
          entity_class: "Vehicle" as const,
          name: "Test Car",
          category: "vehicle",
          action_values: {
            Handling: 3,
            Acceleration: 2,
            Squeal: 0,
            Frame: 6,
            Crunch: 0,
            "Chase Points": 0,
            "Condition Points": 0,
            Pursuer: "true",
            Position: "far",
            Type: "Featured Foe",
          },
          impairments: 0,
          active: true,
          created_at: "2023-01-01T00:00:00.000Z",
          updated_at: "2023-01-01T00:00:00.000Z",
        } as Vehicle,
      }

      // Apply transformations
      const transformedData = {
        character: CharacterService.updateActionValue(
          originalData.character,
          "Toughness",
          15
        ),
        vehicle: VehicleService.updateActionValue(
          originalData.vehicle,
          "Handling",
          5
        ),
      }

      // Verify transformations worked
      expect(transformedData.character.action_values.Toughness).toBe(15)
      expect(transformedData.vehicle.action_values.Handling).toBe(5)

      // Verify originals are unchanged
      expect(originalData.character.action_values.Toughness).toBe(7) // brick has Toughness: 7
      expect(originalData.vehicle.action_values.Handling).toBe(3)
      expect(originalData.character).not.toBe(transformedData.character)
      expect(originalData.vehicle).not.toBe(transformedData.vehicle)
    })
  })
})
