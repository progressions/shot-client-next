import type { Vehicle } from "@/types"
import { defaultVehicle } from "@/types/defaults"
import { brick, carolina, shing } from "./Characters"

// Helper functions for vehicle setup (to be implemented later with VehicleService)
export function pursuer(vehicle: Vehicle, position: string) {
  return {
    ...vehicle,
    action_values: {
      ...vehicle.action_values,
      Pursuer: "true",
      Position: position,
    },
  }
}

export function evader(vehicle: Vehicle, position: string) {
  return {
    ...vehicle,
    action_values: {
      ...vehicle.action_values,
      Pursuer: "false",
      Position: position,
    },
  }
}

export const brickMobile: Vehicle = {
  ...defaultVehicle,
  name: "Brickmobile",
  id: "brickmobile",
  driver: brick,
  action_values: {
    ...defaultVehicle.action_values,
    Type: "PC",
    Acceleration: 8,
    Handling: 8,
    Squeal: 10,
    Frame: 6,
    Crunch: 8,
  },
}

export const copCar: Vehicle = {
  ...defaultVehicle,
  name: "PC",
  id: "copcar",
  driver: carolina,
  action_values: {
    ...defaultVehicle.action_values,
    Type: "Featured Foe",
    Acceleration: 8,
    Handling: 8,
    Squeal: 10,
    Frame: 6,
    Crunch: 8,
  },
}

export const battleTruck: Vehicle = {
  ...defaultVehicle,
  name: "Battle Truck",
  id: "battletruck",
  driver: shing,
  action_values: {
    ...defaultVehicle.action_values,
    Type: "Boss",
    Acceleration: 6,
    Handling: 6,
    Squeal: 8,
    Frame: 10,
    Crunch: 12,
  },
}

export const motorcycles: Vehicle = {
  ...defaultVehicle,
  name: "Motorcycles",
  id: "motorcycles",
  count: 15,
  action_values: {
    ...defaultVehicle.action_values,
    Type: "Mook",
    Acceleration: 6,
    Handling: 8,
    Squeal: 10,
    Frame: 0,
    Crunch: 0,
  },
}

export const hondas: Vehicle = {
  ...defaultVehicle,
  name: "Hondas",
  id: "hondas",
  count: 15,
  action_values: {
    ...defaultVehicle.action_values,
    Type: "Mook",
    Acceleration: 6,
    Handling: 9,
    Squeal: 11,
    Frame: 5,
    Crunch: 7,
  },
}
