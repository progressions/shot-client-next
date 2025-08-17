import type { Character, Position, Vehicle, VehicleArchetype } from "@/types"
import { VehicleDescriptionKeys } from "@/types"
import CS from "@/services/CharacterService"
import SharedService from "@/services/SharedService"

export type DamageReduction = "handling" | "frame"

const VehicleService = {
  ...SharedService,

  mainAttackValue: function (vehicle: Vehicle): number {
    const value = vehicle.driver?.id ? CS.skill(vehicle.driver, "Driving") : 7

    return Math.max(0, value - this.totalImpairments(vehicle))
  },

  totalImpairments: function (vehicle: Vehicle): number {
    if (this.isBoss(vehicle) || this.isUberBoss(vehicle)) {
      return 0
    }
    if (
      vehicle.driver?.id &&
      (CS.isBoss(vehicle.driver) || CS.isUberBoss(vehicle.driver))
    ) {
      return 0
    }
    const driverImpairments = vehicle.driver
      ? CS.impairments(vehicle.driver)
      : 0
    const impairments = driverImpairments + this.impairments(vehicle)
    return Math.min(2, Math.max(0, impairments))
  },

  // Not modified by Impairment
  speed: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Acceleration")
  },

  acceleration: function (vehicle: Vehicle): number {
    return this.speed(vehicle)
  },

  // defense and attack in a chase both use the driver's Driving skill
  defense: function (vehicle: Vehicle): number {
    return this.mainAttackValue(vehicle)
  },

  squeal: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Squeal")
  },

  frame: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Frame")
  },

  crunch: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Crunch")
  },

  handling: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Handling")
  },

  isPursuer: function (vehicle: Vehicle): boolean {
    return this.otherActionValue(vehicle, "Pursuer") === "true"
  },

  isEvader: function (vehicle: Vehicle): boolean {
    return !this.isPursuer(vehicle)
  },

  isNear: function (vehicle: Vehicle): boolean {
    return this.position(vehicle).toLowerCase() === "near".toLowerCase()
  },

  isFar: function (vehicle: Vehicle): boolean {
    return !this.isNear(vehicle)
  },

  position: function (vehicle: Vehicle): Position {
    return this.otherActionValue(vehicle, "Position") as Position
  },

  chasePoints: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Chase Points")
  },

  conditionPoints: function (vehicle: Vehicle): number {
    return this.rawActionValue(vehicle, "Condition Points")
  },

  seriousChasePoints: function (vehicle: Vehicle): boolean {
    return this.seriousPoints(vehicle, this.chasePoints(vehicle))
  },

  seriousConditionPoints: function (vehicle: Vehicle): boolean {
    return this.seriousPoints(vehicle, this.conditionPoints(vehicle))
  },

  damageReduction: function (
    vehicle: Vehicle,
    toughness: DamageReduction = "handling"
  ): number {
    switch (toughness) {
      case "handling": {
        return this.handling(vehicle)
        break
      }
      case "frame": {
        return this.frame(vehicle)
        break
      }
    }
  },

  description: function (vehicle: Vehicle): string {
    return this.descriptionValue(vehicle, VehicleDescriptionKeys.Appearance)
  },

  // Writer functions, modify the vehicle

  evade: function (
    attacker: Vehicle,
    smackdown: number,
    target: Vehicle
  ): [Vehicle, Vehicle] {
    return [attacker, this.takeChasePoints(target, smackdown, "handling")]
  },

  narrowTheGap: function (
    attacker: Vehicle,
    smackdown: number,
    target: Vehicle
  ): [Vehicle, Vehicle] {
    const updatedTarget = this.takeChasePoints(target, smackdown, "handling")

    return [
      this.updatePosition(attacker, "near"),
      this.updatePosition(updatedTarget, "near"),
    ]
  },

  widenTheGap: function (
    attacker: Vehicle,
    smackdown: number,
    target: Vehicle
  ): [Vehicle, Vehicle] {
    const updatedTarget = this.takeChasePoints(target, smackdown, "handling")
    return [
      this.updatePosition(attacker, "far"),
      this.updatePosition(updatedTarget, "far"),
    ]
  },

  // use Frame to reduce the damage
  ramSideswipe: function (
    attacker: Vehicle,
    smackdown: number,
    target: Vehicle
  ): [Vehicle, Vehicle] {
    const bump = this.frame(target) - this.frame(attacker)

    // attacker takes Chase and Condition Points equal to bump
    let updatedAttacker =
      bump > 0 ? this.takeRawConditionPoints(attacker, bump) : attacker
    updatedAttacker =
      bump > 0
        ? this.takeRawChasePoints(updatedAttacker, bump)
        : updatedAttacker

    // target take Chase and Condition Points equal to smackdown
    let updatedTarget = this.takeConditionPoints(target, smackdown, "frame")
    updatedTarget = this.takeChasePoints(updatedTarget, smackdown, "frame")

    return [updatedAttacker, updatedTarget]
  },

  // if the vehicle is a Mook, kill it
  // when hit by a Ram/Sideswipe, use the vehicle's Frame to reduce the damage
  // otherwise, use the vehicle's Handling to reduce the damage
  takeChasePoints: function (
    vehicle: Vehicle,
    smackdown: number,
    toughness: DamageReduction = "handling"
  ): Vehicle {
    if (this.isType(vehicle, "Mook")) {
      return this.killMooks(vehicle, smackdown)
    }

    const chasePoints = this.calculateChasePoints(vehicle, smackdown, toughness)
    const originalChasePoints = this.chasePoints(vehicle)
    const impairments = this.calculateImpairments(
      vehicle,
      originalChasePoints,
      originalChasePoints + chasePoints
    )
    const updatedVehicle = this.addImpairments(vehicle, impairments)

    return this.takeRawChasePoints(updatedVehicle, chasePoints)
  },

  takeRawChasePoints: function (
    vehicle: Vehicle,
    chasePoints: number
  ): Vehicle {
    const originalChasePoints = this.chasePoints(vehicle)
    return this.updateActionValue(
      vehicle,
      "Chase Points",
      Math.max(0, originalChasePoints + chasePoints)
    )
  },

  takeRawConditionPoints: function (
    vehicle: Vehicle,
    conditionPoints: number
  ): Vehicle {
    const originalConditionPoints = this.conditionPoints(vehicle)
    return this.updateActionValue(
      vehicle,
      "Condition Points",
      Math.max(0, originalConditionPoints + conditionPoints)
    )
  },

  calculateChasePoints: function (
    vehicle: Vehicle,
    smackdown: number,
    toughness: DamageReduction = "handling"
  ): number {
    const reduction = this.damageReduction(vehicle, toughness)
    const chasePoints = Math.max(0, smackdown - reduction)

    return chasePoints
  },

  calculateConditionPoints: function (
    vehicle: Vehicle,
    smackdown: number,
    toughness: DamageReduction = "frame"
  ): number {
    const reduction = this.damageReduction(vehicle, toughness)
    const conditionPoints = Math.max(0, smackdown - reduction)

    return conditionPoints
  },

  takeConditionPoints: function (
    vehicle: Vehicle,
    smackdown: number,
    toughness: DamageReduction = "frame"
  ): Vehicle {
    const conditionPoints = this.calculateConditionPoints(
      vehicle,
      smackdown,
      toughness
    )
    const originalConditionPoints = this.conditionPoints(vehicle)

    return this.updateActionValue(
      vehicle,
      "Condition Points",
      Math.max(0, originalConditionPoints + conditionPoints)
    )
  },

  healChasePoints: function (vehicle: Vehicle, value: number): Vehicle {
    const originalChasePoints = this.chasePoints(vehicle)
    const impairments = this.calculateImpairments(
      vehicle,
      originalChasePoints - value,
      originalChasePoints
    )
    const updatedVehicle = this.addImpairments(vehicle, -impairments)

    return this.updateActionValue(
      updatedVehicle,
      "Chase Points",
      Math.max(0, originalChasePoints - value)
    )
  },

  changePosition: function (vehicle: Vehicle): Vehicle {
    const position = this.isNear(vehicle) ? "far" : "near"
    return this.updatePosition(vehicle, position)
  },

  updatePosition: function (vehicle: Vehicle, position: Position): Vehicle {
    const updated = this.updateActionValue(vehicle, "Position", position)
    return updated
  },

  updatePursuer: function (vehicle: Vehicle, pursuer: boolean): Vehicle {
    return this.updateActionValue(
      vehicle,
      "Pursuer",
      pursuer ? "true" : "false"
    )
  },

  updateDriver: function (vehicle: Vehicle, driver: Character | null): Vehicle {
    if (!driver?.id) {
      return { ...vehicle, driver: { id: "", name: "" } } as Vehicle
    }
    return { ...vehicle, driver: driver } as Vehicle
  },

  updateFromArchetype: function (
    vehicle: Vehicle,
    archetype: VehicleArchetype
  ): Vehicle {
    try {
      return {
        ...vehicle,
        name: archetype.name,
        action_values: {
          ...vehicle.action_values,
          Acceleration: archetype["Acceleration"],
          Handling: archetype["Handling"],
          Squeal: archetype["Squeal"],
          Frame: archetype["Frame"],
          Crunch: archetype["Crunch"],
        },
      } as Vehicle
    } catch (error) {
      return vehicle
    }
  },
}

export default VehicleService
