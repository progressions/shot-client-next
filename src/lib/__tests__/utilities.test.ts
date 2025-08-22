import { parseToNumber } from "@/lib/parseToNumber"
import { queryParams } from "@/lib/queryParams"
import { filterConfigs } from "@/lib/filterConfigs"

describe("parseToNumber", () => {
  describe("number inputs", () => {
    it("returns numbers unchanged", () => {
      expect(parseToNumber(42)).toBe(42)
      expect(parseToNumber(0)).toBe(0)
      expect(parseToNumber(-15)).toBe(-15)
      expect(parseToNumber(3.14)).toBe(3.14)
    })

    it("handles special number values", () => {
      expect(parseToNumber(Infinity)).toBe(Infinity)
      expect(parseToNumber(-Infinity)).toBe(-Infinity)
      expect(parseToNumber(NaN)).toBe(NaN) // NaN is typeof 'number'
    })
  })

  describe("string inputs", () => {
    it("parses valid integer strings", () => {
      expect(parseToNumber("42")).toBe(42)
      expect(parseToNumber("0")).toBe(0)
      expect(parseToNumber("-15")).toBe(-15)
      expect(parseToNumber("123")).toBe(123)
    })

    it("parses strings with leading/trailing whitespace", () => {
      expect(parseToNumber("  42  ")).toBe(42)
      expect(parseToNumber("\t123\n")).toBe(123)
      expect(parseToNumber(" -15 ")).toBe(-15)
    })

    it("handles decimal strings by truncating (uses parseInt)", () => {
      expect(parseToNumber("3.14")).toBe(3)
      expect(parseToNumber("42.99")).toBe(42)
      expect(parseToNumber("-7.8")).toBe(-7)
    })

    it("handles strings with numbers followed by text", () => {
      expect(parseToNumber("42px")).toBe(42)
      expect(parseToNumber("123abc")).toBe(123)
      expect(parseToNumber("10 items")).toBe(10)
    })

    it("returns 0 for invalid strings", () => {
      expect(parseToNumber("abc")).toBe(0)
      expect(parseToNumber("")).toBe(0)
      expect(parseToNumber("not a number")).toBe(0)
      expect(parseToNumber("text123")).toBe(0) // Starts with text
    })

    it("returns 0 for strings that cannot be parsed", () => {
      expect(parseToNumber("")).toBe(0)
      expect(parseToNumber("   ")).toBe(0)
      expect(parseToNumber("null")).toBe(0)
      expect(parseToNumber("undefined")).toBe(0)
    })
  })

  describe("edge cases", () => {
    it("returns 0 for null input", () => {
      expect(parseToNumber(null as any)).toBe(0)
    })

    it("returns 0 for undefined input", () => {
      expect(parseToNumber(undefined as any)).toBe(0)
    })

    it("returns 0 for boolean inputs", () => {
      expect(parseToNumber(true as any)).toBe(0)
      expect(parseToNumber(false as any)).toBe(0)
    })

    it("returns 0 for object inputs", () => {
      expect(parseToNumber({} as any)).toBe(0)
      expect(parseToNumber([] as any)).toBe(0)
      expect(parseToNumber({ value: 42 } as any)).toBe(0)
    })

    it("returns 0 for function inputs", () => {
      expect(parseToNumber((() => 42) as any)).toBe(0)
    })
  })

  describe("radix handling", () => {
    it("uses base 10 parsing (not octal)", () => {
      expect(parseToNumber("010")).toBe(10) // Not 8 (octal)
      expect(parseToNumber("08")).toBe(8) // Not NaN
      expect(parseToNumber("09")).toBe(9) // Not NaN
    })

    it("does not parse hexadecimal by default", () => {
      expect(parseToNumber("0xFF")).toBe(0) // parseInt with base 10 stops at 'x'
      expect(parseToNumber("0x10")).toBe(0)
    })
  })
})

describe("queryParams", () => {
  describe("basic functionality", () => {
    it("converts empty object to empty string", () => {
      expect(queryParams({})).toBe("")
    })

    it("converts single parameter", () => {
      expect(queryParams({ key: "value" })).toBe("key=value")
    })

    it("converts multiple parameters", () => {
      const result = queryParams({ foo: "bar", baz: "qux" })
      expect(result).toBe("foo=bar&baz=qux")
    })

    it("handles parameters with no arguments (uses default)", () => {
      expect(queryParams()).toBe("")
    })
  })

  describe("value handling", () => {
    it("handles string values", () => {
      expect(queryParams({ name: "John Doe" })).toBe("name=John Doe")
    })

    it("handles number values", () => {
      expect(queryParams({ age: 25, count: 0 })).toBe("age=25&count=0")
    })

    it("handles boolean values", () => {
      expect(queryParams({ active: true, disabled: false })).toBe("active=true&disabled=false")
    })

    it("handles null values as empty string", () => {
      expect(queryParams({ value: null })).toBe("value=")
    })

    it("handles undefined values as empty string", () => {
      expect(queryParams({ value: undefined })).toBe("value=")
    })

    it("handles empty string values", () => {
      expect(queryParams({ empty: "" })).toBe("empty=")
    })

    it("handles zero values correctly", () => {
      expect(queryParams({ count: 0, price: 0.0 })).toBe("count=0&price=0")
    })
  })

  describe("special characters", () => {
    it("does not URL encode special characters", () => {
      expect(queryParams({ search: "hello world" })).toBe("search=hello world")
      expect(queryParams({ query: "a&b=c" })).toBe("query=a&b=c")
    })

    it("handles equals signs in values", () => {
      expect(queryParams({ equation: "x=y+z" })).toBe("equation=x=y+z")
    })

    it("handles ampersands in values", () => {
      expect(queryParams({ company: "Johnson & Johnson" })).toBe("company=Johnson & Johnson")
    })
  })

  describe("object values", () => {
    it("converts objects to string representation", () => {
      expect(queryParams({ data: { nested: true } })).toBe("data=[object Object]")
    })

    it("converts arrays to string representation", () => {
      expect(queryParams({ items: [1, 2, 3] })).toBe("items=1,2,3")
    })
  })

  describe("key ordering", () => {
    it("maintains key order (in modern JavaScript)", () => {
      const result = queryParams({ c: "3", a: "1", b: "2" })
      expect(result).toBe("c=3&a=1&b=2")
    })
  })

  describe("edge cases", () => {
    it("handles keys with special characters", () => {
      expect(queryParams({ "key-with-dash": "value" })).toBe("key-with-dash=value")
      expect(queryParams({ "key_with_underscore": "value" })).toBe("key_with_underscore=value")
    })

    it("handles numeric keys", () => {
      expect(queryParams({ 123: "numeric-key" })).toBe("123=numeric-key")
    })

    it("handles very long parameter strings", () => {
      const longValue = "a".repeat(1000)
      const result = queryParams({ data: longValue })
      expect(result).toBe(`data=${longValue}`)
      expect(result.length).toBe(1005) // "data=" + 1000 characters
    })
  })
})

describe("filterConfigs", () => {
  describe("configuration structure", () => {
    it("has configurations for all expected entities", () => {
      const expectedEntities = [
        "Character",
        "Vehicle",
        "Fight", 
        "Party",
        "Juncture",
        "User",
        "Site",
        "Campaign",
        "Faction",
        "Schtick",
        "Weapon"
      ]

      expectedEntities.forEach(entity => {
        expect(filterConfigs[entity]).toBeDefined()
        expect(filterConfigs[entity].entityName).toBe(entity)
      })
    })

    it("ensures all configurations have required properties", () => {
      Object.values(filterConfigs).forEach(config => {
        expect(config).toHaveProperty("entityName")
        expect(config).toHaveProperty("fields")
        expect(config).toHaveProperty("responseKeys")
        
        expect(typeof config.entityName).toBe("string")
        expect(Array.isArray(config.fields)).toBe(true)
        expect(typeof config.responseKeys).toBe("object")
      })
    })
  })

  describe("field configurations", () => {
    it("ensures all fields have required properties", () => {
      Object.values(filterConfigs).forEach(config => {
        config.fields.forEach(field => {
          expect(field).toHaveProperty("name")
          expect(field).toHaveProperty("type")
          expect(typeof field.name).toBe("string")
          expect(["entity", "string", "static", "search"]).toContain(field.type)
        })
      })
    })

    it("validates static type fields have staticOptions", () => {
      Object.values(filterConfigs).forEach(config => {
        config.fields.forEach(field => {
          if (field.type === "static") {
            expect(field.staticOptions).toBeDefined()
            expect(Array.isArray(field.staticOptions)).toBe(true)
            expect(field.staticOptions!.length).toBeGreaterThan(0)
          }
        })
      })
    })

    it("ensures search fields are consistently named", () => {
      Object.values(filterConfigs).forEach(config => {
        const searchFields = config.fields.filter(field => field.type === "search")
        searchFields.forEach(field => {
          expect(field.name).toBe("search")
        })
      })
    })
  })

  describe("specific entity configurations", () => {
    it("Character config has expected fields", () => {
      const characterConfig = filterConfigs.Character
      const fieldNames = characterConfig.fields.map(f => f.name)
      
      expect(fieldNames).toContain("character_type")
      expect(fieldNames).toContain("faction")
      expect(fieldNames).toContain("archetype")
      expect(fieldNames).toContain("character")
      expect(fieldNames).toContain("search")
    })

    it("Character type field has correct static options", () => {
      const characterConfig = filterConfigs.Character
      const typeField = characterConfig.fields.find(f => f.name === "character_type")
      
      expect(typeField).toBeDefined()
      expect(typeField!.type).toBe("static")
      expect(typeField!.staticOptions).toEqual([
        "Ally",
        "PC", 
        "Mook",
        "Featured Foe",
        "Boss",
        "Uber-Boss"
      ])
    })

    it("Vehicle config has expected structure", () => {
      const vehicleConfig = filterConfigs.Vehicle
      const fieldNames = vehicleConfig.fields.map(f => f.name)
      
      expect(fieldNames).toContain("type")
      expect(fieldNames).toContain("archetype")
      expect(fieldNames).toContain("faction")
      expect(fieldNames).toContain("vehicle")
      expect(fieldNames).toContain("search")
    })

    it("Fight config has status field with correct options", () => {
      const fightConfig = filterConfigs.Fight
      const statusField = fightConfig.fields.find(f => f.name === "status")
      
      expect(statusField).toBeDefined()
      expect(statusField!.type).toBe("static")
      expect(statusField!.staticOptions).toEqual(["Started", "Unstarted", "Ended"])
    })
  })

  describe("response key mappings", () => {
    it("ensures all entity fields have corresponding response keys", () => {
      Object.values(filterConfigs).forEach(config => {
        config.fields.forEach(field => {
          if (field.type === "entity" && field.responseKey) {
            expect(config.responseKeys).toHaveProperty(field.responseKey)
          } else if (field.type === "string") {
            // String fields typically map to response keys
            if (config.responseKeys[field.name]) {
              expect(typeof config.responseKeys[field.name]).toBe("string")
            }
          }
        })
      })
    })

    it("validates response key values are strings", () => {
      Object.values(filterConfigs).forEach(config => {
        Object.values(config.responseKeys).forEach(responseKey => {
          expect(typeof responseKey).toBe("string")
          expect(responseKey.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe("data consistency", () => {
    it("ensures all configurations are properly typed", () => {
      // This test ensures TypeScript typing is working correctly
      expect(typeof filterConfigs).toBe("object")
      expect(filterConfigs).not.toBeNull()
    })

    it("has no duplicate field names within configurations", () => {
      Object.values(filterConfigs).forEach(config => {
        const fieldNames = config.fields.map(f => f.name)
        const uniqueFieldNames = [...new Set(fieldNames)]
        
        expect(fieldNames.length).toBe(uniqueFieldNames.length)
      })
    })

    it("ensures all entity-type fields allow appropriate filtering", () => {
      Object.values(filterConfigs).forEach(config => {
        const entityFields = config.fields.filter(f => f.type === "entity")
        
        entityFields.forEach(field => {
          // Most entity fields should be in responseKeys unless they're self-referential
          if (field.name !== config.entityName.toLowerCase()) {
            expect(
              config.responseKeys[field.name] || field.allowNone === false
            ).toBeTruthy()
          }
        })
      })
    })
  })

  describe("configuration completeness", () => {
    it("ensures consistent field patterns across similar entities", () => {
      // Entities that should have faction fields
      const factionEntities = ["Character", "Vehicle", "Party", "Juncture", "Site"]
      
      factionEntities.forEach(entityName => {
        const config = filterConfigs[entityName]
        const hasFactionField = config.fields.some(f => f.name === "faction")
        expect(hasFactionField).toBe(true)
      })
    })

    it("ensures all entities have search capability", () => {
      Object.values(filterConfigs).forEach(config => {
        const hasSearchField = config.fields.some(f => f.type === "search")
        expect(hasSearchField).toBe(true)
      })
    })

    it("ensures primary entity fields are marked as required", () => {
      Object.values(filterConfigs).forEach(config => {
        const entityName = config.entityName.toLowerCase()
        const primaryField = config.fields.find(f => f.name === entityName)
        
        if (primaryField) {
          expect(primaryField.allowNone).toBe(false)
        }
      })
    })
  })
})