import { SS } from "@/services"
import type { Person, Vehicle } from "@/types"
import { CharacterTypes } from "@/types"
import { defaultCharacter, defaultVehicle } from "@/types/defaults"

describe("SharedService", () => {
  describe("Character methods", () => {
    describe("name", () => {
      it("returns a character's name", () => {
        const character: Person = {
          ...defaultCharacter,
          name: "Brick Manly",
        }

        expect(SS.name(character)).toBe("Brick Manly")
      })
    })

    describe("hidden", () => {
      it("returns true if the character is hidden", () => {
        const character: Person = {
          ...defaultCharacter,
          current_shot: undefined,
        }

        expect(SS.hidden(character)).toBe(true)
      })

      it("returns false if the character is on a shot", () => {
        const character: Person = {
          ...defaultCharacter,
          current_shot: 1,
        }

        expect(SS.hidden(character)).toBe(false)
      })
    })

    describe("type", () => {
      it("returns the character's type", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.type(character)).toBe(CharacterTypes.PC)
      })
    })

    describe("isCharacter", () => {
      it("returns true for a character", () => {
        const character: Person = defaultCharacter

        expect(SS.isCharacter(character)).toBe(true)
      })
    })

    describe("isVehicle", () => {
      it("returns false for a character", () => {
        const character: Person = defaultCharacter

        expect(SS.isVehicle(character)).toBe(false)
      })
    })

    describe("isFriendly", () => {
      it("returns true for a PC", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.isFriendly(character)).toBe(true)
      })

      it("returns true for an Ally", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Ally,
          },
        }

        expect(SS.isFriendly(character)).toBe(true)
      })

      it("returns false for an Uber-Boss", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.UberBoss,
          },
        }

        expect(SS.isFriendly(character)).toBe(false)
      })

      it("returns false for a Boss", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Boss,
          },
        }

        expect(SS.isFriendly(character)).toBe(false)
      })

      it("returns false for a Featured Foe", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.FeaturedFoe,
          },
        }

        expect(SS.isFriendly(character)).toBe(false)
      })

      it("returns false for a Mook", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.isFriendly(character)).toBe(false)
      })
    })

    describe("isUnfriendly", () => {
      it("returns false for a PC", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(false)
      })

      it("returns false for an Ally", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Ally,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(false)
      })

      it("returns true for an Uber-Boss", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.UberBoss,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(true)
      })

      it("returns true for a Boss", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Boss,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(true)
      })

      it("returns true for a Featured Foe", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.FeaturedFoe,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(true)
      })

      it("returns true for a Mook", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.isUnfriendly(character)).toBe(true)
      })
    })

    describe("type checking methods", () => {
      const testCases = [
        {
          type: CharacterTypes.Mook,
          method: "isMook",
          expected: [true, false, false, false, false, false],
        },
        {
          type: CharacterTypes.PC,
          method: "isPC",
          expected: [false, true, false, false, false, false],
        },
        {
          type: CharacterTypes.Ally,
          method: "isAlly",
          expected: [false, false, true, false, false, false],
        },
        {
          type: CharacterTypes.Boss,
          method: "isBoss",
          expected: [false, false, false, true, false, false],
        },
        {
          type: CharacterTypes.FeaturedFoe,
          method: "isFeaturedFoe",
          expected: [false, false, false, false, true, false],
        },
        {
          type: CharacterTypes.UberBoss,
          method: "isUberBoss",
          expected: [false, false, false, false, false, true],
        },
      ]

      const types = [
        CharacterTypes.Mook,
        CharacterTypes.PC,
        CharacterTypes.Ally,
        CharacterTypes.Boss,
        CharacterTypes.FeaturedFoe,
        CharacterTypes.UberBoss,
      ]

      testCases.forEach(({ type: testType, method, expected }) => {
        describe(method, () => {
          types.forEach((characterType, index) => {
            it(`returns ${expected[index]} for a ${characterType}`, () => {
              const character: Person = {
                ...defaultCharacter,
                action_values: {
                  ...defaultCharacter.action_values,
                  Type: characterType,
                },
              }

              expect((SS as Record<string, (character: Person) => number>)[method](character)).toBe(expected[index])
            })
          })
        })
      })
    })

    describe("isTask", () => {
      it("returns true for a Task", () => {
        const character: Person = {
          ...defaultCharacter,
          task: true,
        }

        expect(SS.isTask(character)).toBe(true)
      })

      it("returns false for a non-Task", () => {
        expect(SS.isTask(defaultCharacter)).toBe(false)
      })
    })

    describe("isType", () => {
      it("compares the type", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.isType(character, CharacterTypes.Mook)).toBe(true)
      })
    })

    describe("actionValue", () => {
      it("returns a numeric action value", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Guns: 13,
          },
        }

        expect(SS.actionValue(character, "Guns")).toBe(13)
      })

      it("returns an action value, reduced by impairment", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Guns: 13,
          },
          impairments: 1,
        }

        expect(SS.actionValue(character, "Guns")).toBe(12)
      })
    })

    describe("rawActionValue", () => {
      it("returns a numeric action value", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Guns: 13,
          },
        }

        expect(SS.rawActionValue(character, "Guns")).toBe(13)
      })

      it("returns an action value, unmodified by impairment", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Guns: 13,
          },
          impairments: 1,
        }

        expect(SS.rawActionValue(character, "Guns")).toBe(13)
      })
    })

    describe("otherActionValue", () => {
      it("returns a string action value", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            MainAttack: "Guns",
          },
        }

        expect(SS.otherActionValue(character, "MainAttack")).toBe("Guns")
      })
    })

    describe("impairments", () => {
      it("returns the number of impairments", () => {
        const character: Person = {
          ...defaultCharacter,
          impairments: 2,
        }

        expect(SS.impairments(character)).toBe(2)
      })
    })

    describe("isImpaired", () => {
      it("returns true if the character has impairments", () => {
        const character: Person = {
          ...defaultCharacter,
          impairments: 2,
        }

        expect(SS.isImpaired(character)).toBe(true)
      })

      it("returns false if the character has no impairments", () => {
        const character: Person = {
          ...defaultCharacter,
          impairments: 0,
        }

        expect(SS.isImpaired(character)).toBe(false)
      })
    })

    describe("addImpairments", () => {
      it("adds an impairment", () => {
        const character: Person = {
          ...defaultCharacter,
          impairments: 0,
        }

        const updatedCharacter = SS.addImpairments(character, 1)
        expect(SS.impairments(updatedCharacter as Person)).toBe(1)
      })
    })

    describe("calculateImpairments", () => {
      it("returns zero for a mook", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.calculateImpairments(character, 24, 35)).toBe(0)
      })

      it("returns 1 for an Uber-Boss going from 39 to 40", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.UberBoss,
          },
        }

        expect(SS.calculateImpairments(character, 39, 40)).toBe(1)
      })

      it("returns 1 for a PC going from 24 to 25", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.calculateImpairments(character, 24, 25)).toBe(1)
      })

      it("returns 2 for a PC going from 24 to 30", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.calculateImpairments(character, 24, 30)).toBe(2)
      })
    })

    describe("updateActionValue", () => {
      it("updates an action value", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            "Action Value": 24,
          },
        }

        const updatedCharacter = SS.updateActionValue(
          character,
          "Action Value",
          25
        )

        expect(updatedCharacter.action_values["Action Value"]).toBe(25)
      })
    })

    describe("updateValue", () => {
      it("updates a value", () => {
        const character: Person = {
          ...defaultCharacter,
          impairments: 0,
        }

        const updatedCharacter = SS.updateValue(character, "impairments", 2)

        expect((updatedCharacter as Person).impairments).toBe(2)
      })
    })

    describe("setInitiative", () => {
      it("sets the current shot, reducing it by the existing current shot", () => {
        const character: Person = {
          ...defaultCharacter,
          current_shot: -1,
        }

        const updatedCharacter = SS.setInitiative(character, 5)
        expect((updatedCharacter as Person).current_shot).toBe(4)
      })

      it("sets the current shot if no existing current shot exists", () => {
        const updatedCharacter = SS.setInitiative(defaultCharacter, 5)
        expect((updatedCharacter as Person).current_shot).toBe(5)
      })
    })

    describe("seriousPoints", () => {
      it("returns false for a Mook", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.seriousPoints(character, 50)).toBe(false)
      })

      it("returns true for an Uber-Boss with 50 or more", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.UberBoss,
          },
        }

        expect(SS.seriousPoints(character, 50)).toBe(true)
      })

      it("returns true for a PC with 35 or more", () => {
        const character: Person = {
          ...defaultCharacter,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.PC,
          },
        }

        expect(SS.seriousPoints(character, 35)).toBe(true)
      })
    })

    describe("mooks", () => {
      it("returns the count of Mooks", () => {
        const character: Person = {
          ...defaultCharacter,
          count: 15,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        expect(SS.mooks(character)).toBe(15)
      })

      it("returns zero for a non Mook", () => {
        expect(SS.mooks(defaultCharacter)).toBe(0)
      })
    })

    describe("killMooks", () => {
      it("reduces the count of mooks", () => {
        const character: Person = {
          ...defaultCharacter,
          count: 15,
          action_values: {
            ...defaultCharacter.action_values,
            Type: CharacterTypes.Mook,
          },
        }

        const updatedCharacter = SS.killMooks(character, 5)
        expect((updatedCharacter as Person).count).toBe(10)
      })
    })
  })

  describe("Vehicle methods", () => {
    describe("name", () => {
      it("returns a vehicle's name", () => {
        const vehicle: Vehicle = {
          ...defaultVehicle,
          name: "Battle Truck",
        }

        expect(SS.name(vehicle)).toBe("Battle Truck")
      })
    })

    describe("hidden", () => {
      it("returns true if the vehicle is hidden", () => {
        const vehicle: Vehicle = {
          ...defaultVehicle,
          current_shot: undefined,
        }

        expect(SS.hidden(vehicle)).toBe(true)
      })

      it("returns false if the vehicle is on a shot", () => {
        const vehicle: Vehicle = {
          ...defaultVehicle,
          current_shot: 1,
        }

        expect(SS.hidden(vehicle)).toBe(false)
      })
    })

    describe("isVehicle", () => {
      it("returns true for a vehicle", () => {
        const vehicle: Vehicle = defaultVehicle

        expect(SS.isVehicle(vehicle)).toBe(true)
      })
    })

    describe("isCharacter", () => {
      it("returns false for a vehicle", () => {
        const vehicle: Vehicle = defaultVehicle

        expect(SS.isCharacter(vehicle)).toBe(false)
      })
    })
  })
})
