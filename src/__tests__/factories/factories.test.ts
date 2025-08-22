import { brick, carolina, shing, zombies } from "./Characters"
import { derringer, ak47 } from "./Weapons"
import { brickMobile, copCar, battleTruck } from "./Vehicles"

describe("Test Factories", () => {
  describe("Character Factories", () => {
    it("should create valid character objects", () => {
      expect(brick.name).toBe("Brick Manly")
      expect(brick.action_values.Type).toBe("PC")
      expect(brick.action_values["Martial Arts"]).toBe(14)

      expect(carolina.name).toBe("Carolina Kominsky")
      expect(carolina.action_values.Type).toBe("PC")
      expect(carolina.skills.Driving).toBe(13)

      expect(shing.name).toBe("Ugly Shing")
      expect(shing.action_values.Type).toBe("Boss")

      expect(zombies.name).toBe("Zombies")
      expect(zombies.action_values.Type).toBe("Mook")
      expect(zombies.count).toBe(15)
    })

    it("should have proper entity_class", () => {
      expect(brick.entity_class).toBe("Person")
      expect(carolina.entity_class).toBe("Person")
      expect(shing.entity_class).toBe("Person")
      expect(zombies.entity_class).toBe("Person")
    })
  })

  describe("Weapon Factories", () => {
    it("should create valid weapon objects", () => {
      expect(derringer.name).toBe("American Derringer Mini-Cop")
      expect(derringer.damage).toBe(11)
      expect(derringer.category).toBe("Autoloader Handguns")

      expect(ak47.name).toBe("AK-47")
      expect(ak47.damage).toBe(13)
      expect(ak47.category).toBe("Rifles")
    })

    it("should have proper entity_class", () => {
      expect(derringer.entity_class).toBe("Weapon")
      expect(ak47.entity_class).toBe("Weapon")
    })
  })

  describe("Vehicle Factories", () => {
    it("should create valid vehicle objects", () => {
      expect(brickMobile.name).toBe("Brickmobile")
      expect(brickMobile.action_values.Type).toBe("PC")
      expect(brickMobile.action_values.Acceleration).toBe(8)

      expect(copCar.name).toBe("PC")
      expect(copCar.action_values.Type).toBe("Featured Foe")

      expect(battleTruck.name).toBe("Battle Truck")
      expect(battleTruck.action_values.Type).toBe("Boss")
    })

    it("should have proper entity_class", () => {
      expect(brickMobile.entity_class).toBe("Vehicle")
      expect(copCar.entity_class).toBe("Vehicle")
      expect(battleTruck.entity_class).toBe("Vehicle")
    })
  })
})
