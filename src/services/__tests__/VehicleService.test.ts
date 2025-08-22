import { VS } from "@/services"
import type { Vehicle, Person } from "@/types"
import { defaultVehicle } from "@/types/defaults"
import {
  brickMobile,
  copCar,
  battleTruck,
  motorcycles,
} from "@/__tests__/factories/Vehicles"
import { brick, shing } from "@/__tests__/factories/Characters"

describe("VehicleService", () => {
  describe("mainAttackValue", () => {
    it("returns the driver's Driving skill", () => {
      expect(VS.mainAttackValue(copCar)).toBe(13) // carolina has Driving: 13
    })

    it("returns 7 if there's no driver", () => {
      const vehicleWithoutDriver: Vehicle = {
        ...defaultVehicle,
        driver: undefined,
      }
      expect(VS.mainAttackValue(vehicleWithoutDriver)).toBe(7)
    })

    it("returns the driver's Driving skill modified by impairments", () => {
      const impairedVehicle: Vehicle = {
        ...brickMobile,
        impairments: 1,
      }
      // Brick doesn't have explicit Driving skill, so defaults to 7, minus 1 impairment = 6
      expect(VS.mainAttackValue(impairedVehicle)).toBe(6)
    })
  })

  describe("speed and acceleration", () => {
    it("returns the Acceleration value", () => {
      expect(VS.speed(brickMobile)).toBe(8)
      expect(VS.acceleration(brickMobile)).toBe(8)
    })

    it("returns Acceleration without impairment modification", () => {
      const impairedVehicle: Vehicle = {
        ...brickMobile,
        impairments: 2,
      }
      expect(VS.speed(impairedVehicle)).toBe(8) // Speed not affected by impairments
    })
  })

  describe("defense", () => {
    it("returns the driver's attack value (same as mainAttackValue)", () => {
      expect(VS.defense(copCar)).toBe(VS.mainAttackValue(copCar))
      expect(VS.defense(copCar)).toBe(13)
    })
  })

  describe("vehicle stats", () => {
    it("returns correct handling values", () => {
      expect(VS.handling(brickMobile)).toBe(8)
      expect(VS.handling(battleTruck)).toBe(6)
    })

    it("returns correct frame values", () => {
      expect(VS.frame(brickMobile)).toBe(6)
      expect(VS.frame(battleTruck)).toBe(10)
    })

    it("returns correct squeal values", () => {
      expect(VS.squeal(brickMobile)).toBe(10)
      expect(VS.squeal(battleTruck)).toBe(8)
    })

    it("returns correct crunch values", () => {
      expect(VS.crunch(brickMobile)).toBe(8)
      expect(VS.crunch(battleTruck)).toBe(12)
    })
  })

  describe("position and role", () => {
    it("should identify pursuer vehicles", () => {
      const pursuerVehicle = VS.updateActionValue(
        brickMobile,
        "Pursuer",
        "true"
      )
      expect(VS.isPursuer(pursuerVehicle)).toBe(true)
      expect(VS.isEvader(pursuerVehicle)).toBe(false)
    })

    it("should identify evader vehicles", () => {
      const evaderVehicle = VS.updateActionValue(
        brickMobile,
        "Pursuer",
        "false"
      )
      expect(VS.isEvader(evaderVehicle)).toBe(true)
      expect(VS.isPursuer(evaderVehicle)).toBe(false)
    })

    it("should identify near and far positions", () => {
      const nearVehicle = VS.updateActionValue(brickMobile, "Position", "near")
      const farVehicle = VS.updateActionValue(brickMobile, "Position", "far")

      expect(VS.isNear(nearVehicle)).toBe(true)
      expect(VS.isFar(nearVehicle)).toBe(false)

      expect(VS.isFar(farVehicle)).toBe(true)
      expect(VS.isNear(farVehicle)).toBe(false)
    })
  })

  describe("chase and condition points", () => {
    it("should return chase points", () => {
      const vehicleWithPoints = VS.updateActionValue(
        brickMobile,
        "Chase Points",
        15
      )
      expect(VS.chasePoints(vehicleWithPoints)).toBe(15)
    })

    it("should return condition points", () => {
      const vehicleWithPoints = VS.updateActionValue(
        brickMobile,
        "Condition Points",
        8
      )
      expect(VS.conditionPoints(vehicleWithPoints)).toBe(8)
    })
  })

  describe("damage reduction", () => {
    it("should return handling for handling-based reduction", () => {
      expect(VS.damageReduction(brickMobile, "handling")).toBe(8)
    })

    it("should return frame for frame-based reduction", () => {
      expect(VS.damageReduction(brickMobile, "frame")).toBe(6)
    })

    it("should default to handling", () => {
      expect(VS.damageReduction(brickMobile)).toBe(8)
    })
  })

  describe("totalImpairments", () => {
    it("should combine driver and vehicle impairments", () => {
      const impairedDriver: Person = {
        ...brick,
        impairments: 1,
      }
      const impairedVehicle: Vehicle = {
        ...brickMobile,
        driver: impairedDriver,
        impairments: 1,
      }

      expect(VS.totalImpairments(impairedVehicle)).toBe(2)
    })

    it("should cap impairments at 2", () => {
      const veryImpairedDriver: Person = {
        ...brick,
        impairments: 3,
      }
      const veryImpairedVehicle: Vehicle = {
        ...brickMobile,
        driver: veryImpairedDriver,
        impairments: 3,
      }

      expect(VS.totalImpairments(veryImpairedVehicle)).toBe(2)
    })

    it("should ignore impairments for boss vehicles", () => {
      const impairedBoss: Vehicle = {
        ...battleTruck,
        impairments: 2,
      }

      expect(VS.totalImpairments(impairedBoss)).toBe(0)
    })

    it("should ignore impairments for vehicles with boss drivers", () => {
      const bossDriver: Person = {
        ...shing, // shing is a Boss
      }
      const vehicleWithBossDriver: Vehicle = {
        ...brickMobile,
        driver: bossDriver,
        impairments: 2,
      }

      expect(VS.totalImpairments(vehicleWithBossDriver)).toBe(0)
    })
  })

  describe("chase actions", () => {
    it("should handle evade action", () => {
      const [updatedAttacker, updatedTarget] = VS.evade(brickMobile, 10, copCar)

      expect(updatedAttacker).toEqual(brickMobile) // Attacker unchanged
      expect(VS.chasePoints(updatedTarget)).toBe(2) // 10 - 8 handling = 2 chase points
    })

    it("should handle narrowTheGap action", () => {
      const [updatedAttacker, updatedTarget] = VS.narrowTheGap(
        brickMobile,
        10,
        copCar
      )

      expect(VS.position(updatedAttacker)).toBe("near")
      expect(VS.position(updatedTarget)).toBe("near")
      expect(VS.chasePoints(updatedTarget)).toBe(2) // 10 - 8 handling = 2 chase points
    })

    it("should handle widenTheGap action", () => {
      const [updatedAttacker, updatedTarget] = VS.widenTheGap(
        brickMobile,
        10,
        copCar
      )

      expect(VS.position(updatedAttacker)).toBe("far")
      expect(VS.position(updatedTarget)).toBe("far")
      expect(VS.chasePoints(updatedTarget)).toBe(2) // 10 - 8 handling = 2 chase points
    })
  })

  describe("type checking", () => {
    it("should identify vehicle types correctly", () => {
      expect(VS.isPC(brickMobile)).toBe(true)
      expect(VS.isBoss(battleTruck)).toBe(true)
      expect(VS.isMook(motorcycles)).toBe(true)
    })
  })
})
