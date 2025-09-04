import type { Vehicle } from "@/types/types"
import { defaultSwerve } from "@/types/types"
import { ChaseMethod, ChaseFormData, initialChaseFormData } from "@/types/chase"
import CRS from "@/services/ChaseReducerService"
import VS from "@/services/VehicleService"
import {
  brickMobile,
  copCar,
  battleTruck,
  motorcycles,
} from "@/__tests__/factories/Vehicles"

function _roll(result: number) {
  return {
    ...defaultSwerve,
    result: result,
  }
}

describe("ChaseReducerService", () => {
  let _state: ChaseFormData

  beforeEach(() => {
    // Reset the mocked function before each test
    jest.restoreAllMocks()
  })

  describe("process", () => {
    it("calls resolveMookAttacks for a Mook attacker", () => {
      const state = {
        ...initialChaseFormData,
        edited: true,
        attacker: motorcycles,
        count: 5,
        defense: 13,
      }
      const resolveMookAttacksMock = jest.spyOn(CRS, "resolveMookAttacks")
      CRS.process(state)
      expect(resolveMookAttacksMock).toHaveBeenCalled()
    })

    it("rolls attack and resolves it", () => {
      const resolveAttackMock = jest.spyOn(CRS, "resolveAttack")
      const state = {
        ...initialChaseFormData,
        attacker: brickMobile,
        target: copCar,
        edited: true,
      }
      CRS.process(state)
      expect(resolveAttackMock).toHaveBeenCalled()
    })

    it("doesn't roll attacks if edited is false", () => {
      const resolveAttackMock = jest.spyOn(CRS, "resolveAttack")
      const state = {
        ...initialChaseFormData,
        edited: false,
      }
      CRS.process(state)
      expect(resolveAttackMock).not.toHaveBeenCalled()
    })
  })

  describe("resolveAttack", () => {
    it("calls killMooks for a Mook target", () => {
      const state = {
        ...initialChaseFormData,
        attacker: brickMobile,
        target: motorcycles,
        count: 5,
        defense: 13,
      }
      const killMooksMock = jest.spyOn(CRS, "killMooks")
      CRS.resolveAttack(state)
      expect(killMooksMock).toHaveBeenCalled()
    })

    it("calls processMethod for a non-Mook attacker and target", () => {
      const state = {
        ...initialChaseFormData,
        attacker: brickMobile,
        target: battleTruck,
        defense: 13,
        smackdown: 15,
      }
      const updatedTarget = {
        ...brickMobile,
        action_values: {
          ...brickMobile.action_values,
          "Chase Points": 10,
          "Condition Points": 10,
        },
      }
      const processMethodMock = jest.spyOn(CRS, "processMethod")
      processMethodMock.mockReturnValue([brickMobile, updatedTarget])
      const calculateAttackValuesMock = jest.spyOn(CRS, "calculateAttackValues")
      calculateAttackValuesMock.mockReturnValue(state)

      const result = CRS.resolveAttack(state)

      expect(processMethodMock).toHaveBeenCalledWith(state, 15)
      expect(result.chasePoints).toEqual(10)
      expect(result.conditionPoints).toEqual(10)
      expect(VS.chasePoints(result.target)).toEqual(10)
      expect(VS.conditionPoints(result.target)).toEqual(10)
    })
  })

  describe("resolveMookAttacks", () => {
    it("collects the results of mook attacks", () => {
      const calculateAttackValuesMock = jest.spyOn(CRS, "calculateAttackValues")

      const state: ChaseFormData = {
        ...initialChaseFormData,
        attacker: motorcycles,
        target: brickMobile,
        count: 2,
        defense: 13,
        actionValue: 15,
        handling: 6,
      }

      calculateAttackValuesMock
        .mockReturnValueOnce({
          ...state,
          success: true,
          chasePoints: 5,
        })
        .mockReturnValueOnce({
          ...state,
          success: true,
          chasePoints: 10,
        })

      const result = CRS.resolveMookAttacks(state)
      expect(result.chasePoints).toEqual(15)
      expect(result.conditionPoints).toEqual(0)
      expect(result.success).toEqual(true)
    })

    it("collects the results of failed mook attacks", () => {
      const calculateAttackValuesMock = jest.spyOn(CRS, "calculateAttackValues")

      const state: ChaseFormData = {
        ...initialChaseFormData,
        attacker: motorcycles,
        target: brickMobile,
        count: 2,
        defense: 13,
        actionValue: 15,
        handling: 6,
      }

      calculateAttackValuesMock
        .mockReturnValueOnce({
          ...state,
          success: false,
          chasePoints: null,
        })
        .mockReturnValueOnce({
          ...state,
          success: false,
          chasePoints: null,
        })

      const result = CRS.resolveMookAttacks(state)
      expect(result.chasePoints).toEqual(0)
      expect(result.conditionPoints).toEqual(0)
      expect(result.success).toEqual(false)
    })

    it("collects the results of mixed mook attacks", () => {
      const calculateAttackValuesMock = jest.spyOn(CRS, "calculateAttackValues")

      const state: ChaseFormData = {
        ...initialChaseFormData,
        attacker: motorcycles,
        target: brickMobile,
        count: 2,
        defense: 13,
        actionValue: 15,
        handling: 6,
      }

      calculateAttackValuesMock
        .mockReturnValueOnce({
          ...state,
          success: false,
          chasePoints: null,
        })
        .mockReturnValueOnce({
          ...state,
          success: true,
          chasePoints: 5,
        })

      const result = CRS.resolveMookAttacks(state)
      expect(result.chasePoints).toEqual(5)
      expect(result.conditionPoints).toEqual(0)
      expect(result.success).toEqual(true)
    })
  })

  describe("killMooks", () => {
    it("reduces the mook count by the number of mooks killed", () => {
      const attacker = brickMobile
      const target = motorcycles

      const state = {
        ...initialChaseFormData,
        success: true,
        attacker: attacker,
        target: target,
      }
      const updatedAttacker = VS.updatePosition(attacker, "near")
      const updatedTarget = { ...target, count: 10 }
      const processMethod = jest.spyOn(CRS, "processMethod")
      processMethod.mockReturnValueOnce([updatedAttacker, updatedTarget])

      CRS.killMooks(state)
      expect(VS.isNear(result.attacker)).toEqual(true)
      expect(VS.mooks(result.target)).toEqual(10)
    })

    it("does nothing if the attack was not a success", () => {
      const processMethod = jest.spyOn(CRS, "processMethod")
      const state = {
        ...initialChaseFormData,
        success: false,
      }

      CRS.killMooks(state)
      expect(processMethod).not.toHaveBeenCalled()
    })
  })

  describe("calculateAttackValues", () => {
    it("calculates modified display values for a Mook", () => {
      const attacker = brickMobile
      const target = motorcycles

      const swerve6 = {
        ...defaultSwerve,
        result: 6,
      }
      const state = {
        ...initialChaseFormData,
        swerve: swerve6,
        attacker: attacker,
        target: target,
        count: 2,
        defense: 13,
        actionValue: 15,
      }
      CRS.calculateAttackValues(state)
      expect(result.modifiedDefense).toEqual("13")
      expect(result.modifiedActionValue).toEqual("15")
      expect(result.mookDefense).toEqual(15)
    })

    it("calculates modified display values for a non-Mook", () => {
      const attacker = brickMobile
      const target = copCar
      const swerve6 = {
        ...defaultSwerve,
        result: 6,
      }
      const state = {
        ...initialChaseFormData,
        swerve: swerve6,
        attacker: attacker,
        target: target,
        defense: 13,
        actionValue: 15,
      }
      CRS.calculateAttackValues(state)
      expect(result.modifiedDefense).toEqual("13")
      expect(result.modifiedActionValue).toEqual("15")
      expect(result.mookDefense).toEqual(13)
    })

    it("calls this.pursue for a Pursuer", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "true")
      const target = VS.updateActionValue(motorcycles, "Pursuer", "false")
      const swerve6 = {
        ...defaultSwerve,
        result: 6,
      }
      const state = {
        ...initialChaseFormData,
        swerve: swerve6,
        attacker: attacker,
        target: target,
        defense: 13,
        actionValue: 15,
      }
      const resultState = {
        ...state,
        modifiedDefense: "13",
        modifiedActionValue: "15",
        mookDefense: 13,
      }

      const pursueMock = jest.spyOn(CRS, "pursue")
      const evadeMock = jest.spyOn(CRS, "evade")
      CRS.calculateAttackValues(state)

      expect(evadeMock).not.toHaveBeenCalled()
      const calls = pursueMock.mock.calls
      expect(calls[0][0].modifiedDefense).toEqual("13")
      expect(calls[0][0].modifiedActionValue).toEqual("15")
      expect(calls[0][0].mookDefense).toEqual(13)
    })

    it("calls this.evade for an Evader", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "false")
      const target = VS.updateActionValue(motorcycles, "Pursuer", "true")
      const swerve6 = {
        ...defaultSwerve,
        result: 6,
      }
      const state = {
        ...initialChaseFormData,
        swerve: swerve6,
        attacker: attacker,
        target: target,
        defense: 13,
        actionValue: 15,
      }
      const resultState = {
        ...state,
        modifiedDefense: "13",
        modifiedActionValue: "15",
        mookDefense: 13,
      }

      const pursueMock = jest.spyOn(CRS, "pursue")
      const evadeMock = jest.spyOn(CRS, "evade")

      CRS.calculateAttackValues(state)

      expect(pursueMock).not.toHaveBeenCalled()
      const calls = evadeMock.mock.calls
      expect(calls[0][0].modifiedDefense).toEqual("13")
      expect(calls[0][0].modifiedActionValue).toEqual("15")
      expect(calls[0][0].mookDefense).toEqual(13)
    })
  })

  describe("pursue", () => {
    it("returns a successful result", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "true")
      const target = VS.updateActionValue(copCar, "Pursuer", "false")
      const state = {
        ...initialChaseFormData,
        swerve: {
          ...defaultSwerve,
          result: 6,
        },
        attacker: attacker,
        target: target,
        squeal: 8,
        handling: 6,
        actionValue: 15,
        mookDefense: 13,
      }
      const result = CRS.pursue(state)
      expect(result.actionResult).toEqual(21)
      expect(result.outcome).toEqual(8)
      expect(result.success).toEqual(true)
      expect(result.smackdown).toEqual(16)
      expect(result.position).toEqual("near")

      // Swerve of 6 plus actionValue of 15 is 21, which is 8 over the
      // target's defense of 13, so the result is a hit, with an outcome
      // of 8. The attacker's squeal is 8, so the smackdown is 16.
      // The target's Handling is 6, so the chasePoints are 10.
      expect(result.chasePoints).toEqual(10)
      expect(result.conditionPoints).toEqual(null)
    })

    it("returns a successful sideswipe", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "true")
      const target = VS.updateActionValue(copCar, "Pursuer", "false")
      const state = {
        ...initialChaseFormData,
        swerve: {
          ...defaultSwerve,
          result: 6,
        },
        attacker: attacker,
        target: target,
        squeal: 8,
        handling: 6,
        frame: 9,
        crunch: 11,
        actionValue: 15,
        mookDefense: 13,
        method: ChaseMethod.RAM_SIDESWIPE,
      }
      const result = CRS.pursue(state)
      expect(result.actionResult).toEqual(21)
      expect(result.outcome).toEqual(8)
      expect(result.success).toEqual(true)
      expect(result.smackdown).toEqual(19)
      expect(result.position).toEqual("far")

      // Swerve of 6 plus actionValue of 15 is 21, which is 8 over the
      // target's defense of 13, so the result is a hit, with an outcome
      // of 8. The attacker's Crunch is 11, so the smackdown is 19.
      // The target's Frame is 9, so the chasePoints are 10.
      expect(result.chasePoints).toEqual(10)
      expect(result.conditionPoints).toEqual(10)
    })

    it("returns an unsuccessful result", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "true")
      const target = VS.updateActionValue(copCar, "Pursuer", "false")
      const state = {
        ...initialChaseFormData,
        swerve: {
          ...defaultSwerve,
          result: -6,
        },
        attacker: attacker,
        target: target,
        squeal: 8,
        handling: 6,
        actionValue: 15,
        mookDefense: 13,
      }
      const result = CRS.pursue(state)
      expect(result.actionResult).toEqual(9)
      expect(result.outcome).toEqual(-4)
      expect(result.success).toEqual(false)
      expect(result.smackdown).toEqual(null)
      expect(result.position).toEqual("far")

      // Swerve of -6 plus actionValue of 15 is 9, which is 4 under the
      // target's defense of 13, so the result is a miss, with an outcome
      // of -4.
      expect(result.chasePoints).toEqual(null)
      expect(result.conditionPoints).toEqual(null)
    })
  })

  describe("evade", () => {
    it("returns a successful result", () => {
      const attacker = VS.updateActionValue(brickMobile, "Pursuer", "false")
      const target = VS.updateActionValue(copCar, "Pursuer", "true")
      const state = {
        ...initialChaseFormData,
        swerve: {
          ...defaultSwerve,
          result: 6,
        },
        attacker: attacker,
        target: target,
        squeal: 8,
        handling: 6,
        actionValue: 15,
        mookDefense: 13,
      }
      const result = CRS.evade(state)

      expect(result.actionResult).toEqual(21)
      expect(result.outcome).toEqual(8)
      expect(result.success).toEqual(true)
      expect(result.smackdown).toEqual(16)
      expect(result.position).toEqual("far")

      // Swerve of 6 plus actionValue of 15 is 21, which is 8 over the
      // target's defense of 13, so the result is a hit, with an outcome
      // of 8. The attacker's squeal is 8, so the smackdown is 16.
      // The target's Handling is 6, so the chasePoints are 10.
      expect(result.chasePoints).toEqual(10)
      expect(result.conditionPoints).toEqual(null)
    })
  })

  describe("R", () => {
    describe("mainAttackString", () => {
      it("returns the state's action value", () => {
        const state = {
          ...initialChaseFormData,
          actionValue: 13,
        }
        const actionValue = CRS.R.mainAttackString(state)
        expect(actionValue).toEqual("13")
      })
    })

    describe("targetMookDefense", () => {
      it("returns the given defense for a non-Mook", () => {
        const vehicle = brickMobile
        const state = {
          ...initialChaseFormData,
          target: vehicle,
          count: 1,
          defense: 13,
        }
        const defense = CRS.R.targetMookDefense(state)
        expect(defense).toEqual(13)
      })

      it("returns the given defense for a count of 1", () => {
        const vehicle = motorcycles
        const state = {
          ...initialChaseFormData,
          target: vehicle,
          count: 1,
          defense: 13,
        }
        const defense = CRS.R.targetMookDefense(state)
        expect(defense).toEqual(13)
      })

      it("adds 5 to the given defense for a count of 5", () => {
        const vehicle = motorcycles
        const state = {
          ...initialChaseFormData,
          target: vehicle,
          count: 5,
          defense: 13,
        }
        const defense = CRS.R.targetMookDefense(state)
        expect(defense).toEqual(18)
      })
    })

    describe("defenseString", () => {
      it("returns the state's defense value", () => {
        const vehicle = copCar
        const state = {
          ...initialChaseFormData,
          defense: 13,
          target: vehicle,
        }
        const defense = CRS.R.defenseString(state)
        expect(defense).toEqual("13")
      })

      it("returns a defense value with a +2 bonus if the state's stunt is true", () => {
        const vehicle = copCar
        const state = {
          ...initialChaseFormData,
          defense: 13,
          target: vehicle,
          stunt: true,
        }
        const defense = CRS.R.defenseString(state)
        expect(defense).toEqual("15*")
      })

      it("returns a defense value with a * if the target is impaired", () => {
        const vehicle: Vehicle = {
          ...copCar,
          impairments: 1,
        }
        const state = {
          ...initialChaseFormData,
          defense: 13,
          target: vehicle,
        }
        const defense = CRS.R.defenseString(state)
        expect(defense).toEqual("13*")
      })
    })

    describe("calculateToughness", () => {
      it("returns frame if the method is RAM_SIDESWIPE", () => {
        const state = {
          ...initialChaseFormData,
          frame: 7,
          handling: 5,
          method: ChaseMethod.RAM_SIDESWIPE,
        }
        expect(CRS.R.calculateToughness(state)).toEqual(state.frame)
      })

      it("returns handling if the method is EVADE", () => {
        const state = {
          ...initialChaseFormData,
          frame: 7,
          handling: 5,
          method: ChaseMethod.EVADE,
        }
        expect(CRS.R.calculateToughness(state)).toEqual(state.handling)
      })

      it("returns handling if the method is NARROW_THE_GAP", () => {
        const state = {
          ...initialChaseFormData,
          frame: 7,
          handling: 5,
          method: ChaseMethod.NARROW_THE_GAP,
        }
        expect(CRS.R.calculateToughness(state)).toEqual(state.handling)
      })

      it("returns handling if the method is WIDEN_THE_GAP", () => {
        const state = {
          ...initialChaseFormData,
          frame: 7,
          handling: 5,
          method: ChaseMethod.WIDEN_THE_GAP,
        }
        expect(CRS.R.calculateToughness(state)).toEqual(state.handling)
      })
    })

    describe("calculateDamage", () => {
      it("returns crunch if the method is RAM_SIDEWIPE", () => {
        const state = {
          ...initialChaseFormData,
          crunch: 9,
          squeal: 7,
          method: ChaseMethod.RAM_SIDESWIPE,
        }
        expect(CRS.R.calculateDamage(state)).toEqual(state.crunch)
      })

      it("returns squeal if the method is EVADE", () => {
        const state = {
          ...initialChaseFormData,
          crunch: 9,
          squeal: 7,
          method: ChaseMethod.EVADE,
        }
        expect(CRS.R.calculateDamage(state)).toEqual(state.squeal)
      })

      it("returns squeal if the method is NARROW_THE_GAP", () => {
        const state = {
          ...initialChaseFormData,
          crunch: 9,
          squeal: 7,
          method: ChaseMethod.NARROW_THE_GAP,
        }
        expect(CRS.R.calculateDamage(state)).toEqual(state.squeal)
      })

      it("returns squeal if the method is WIDEN_THE_GAP", () => {
        const state = {
          ...initialChaseFormData,
          crunch: 9,
          squeal: 7,
          method: ChaseMethod.WIDEN_THE_GAP,
        }
        expect(CRS.R.calculateDamage(state)).toEqual(state.squeal)
      })
    })
  })
})
