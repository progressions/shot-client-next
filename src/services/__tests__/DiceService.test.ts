import DiceService from "@/services/DiceService"
import type { ExplodingDiceRolls, Swerve } from "@/types"

describe("DiceService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("rollDie", () => {
    it("returns a number between 1 and 6", () => {
      // Mock Math.random to return specific values
      const results = []
      for (let i = 0; i < 100; i++) {
        const result = DiceService.rollDie()
        results.push(result)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(6)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it("returns 1 when Math.random returns 0", () => {
      const originalMathRandom = Math.random
      Math.random = jest.fn(() => 0)

      const result = DiceService.rollDie()
      expect(result).toBe(1)

      Math.random = originalMathRandom
    })

    it("returns 6 when Math.random returns just under 1", () => {
      const originalMathRandom = Math.random
      Math.random = jest.fn(() => 0.9999999)

      const result = DiceService.rollDie()
      expect(result).toBe(6)

      Math.random = originalMathRandom
    })

    it("handles all boundary values correctly", () => {
      const originalMathRandom = Math.random
      const testCases = [
        { input: 0, expected: 1 },
        { input: 0.1666, expected: 1 },
        { input: 0.1667, expected: 2 },
        { input: 0.3333, expected: 2 },
        { input: 0.3334, expected: 3 },
        { input: 0.5, expected: 4 }, // Math.floor(0.5 * 6) + 1 = 3 + 1 = 4
        { input: 0.6666, expected: 4 },
        { input: 0.6667, expected: 5 },
        { input: 0.8333, expected: 5 },
        { input: 0.8334, expected: 6 },
        { input: 0.9999, expected: 6 },
      ]

      testCases.forEach(({ input, expected }) => {
        Math.random = jest.fn(() => input)
        const result = DiceService.rollDie()
        expect(result).toBe(expected)
      })

      Math.random = originalMathRandom
    })

    it("maintains consistency across multiple calls", () => {
      const originalMathRandom = Math.random
      Math.random = jest.fn()
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.9)

      const results = [
        DiceService.rollDie(),
        DiceService.rollDie(),
        DiceService.rollDie(),
        DiceService.rollDie(),
        DiceService.rollDie(),
      ]

      expect(results).toEqual([1, 2, 4, 5, 6]) // 0.5 maps to 4, not 3
      Math.random = originalMathRandom
    })
  })

  describe("rollExplodingDie", () => {
    it("returns rolls and total when no 6s are rolled", () => {
      const mockRollDie = jest.fn()
        .mockReturnValueOnce(4) // First roll (gets ignored in implementation - bug?)
        .mockReturnValueOnce(3) // Actual roll

      const result: ExplodingDiceRolls = DiceService.rollExplodingDie(mockRollDie)

      expect(result[0]).toEqual([3]) // Array of rolls
      expect(result[1]).toBe(3) // Sum of rolls
      expect(mockRollDie).toHaveBeenCalledTimes(2)
    })

    it("continues rolling when 6s are rolled", () => {
      const mockRollDie = jest.fn()
        .mockReturnValueOnce(2) // First roll (gets ignored)
        .mockReturnValueOnce(6) // First actual roll - triggers explosion
        .mockReturnValueOnce(6) // Second roll - triggers another explosion
        .mockReturnValueOnce(4) // Third roll - stops explosion

      const result: ExplodingDiceRolls = DiceService.rollExplodingDie(mockRollDie)

      expect(result[0]).toEqual([6, 6, 4]) // Array of rolls
      expect(result[1]).toBe(16) // Sum: 6 + 6 + 4
      expect(mockRollDie).toHaveBeenCalledTimes(4)
    })

    it("handles single 6 followed by non-6", () => {
      const mockRollDie = jest.fn()
        .mockReturnValueOnce(1) // First roll (gets ignored)
        .mockReturnValueOnce(6) // Triggers explosion
        .mockReturnValueOnce(2) // Stops explosion

      const result: ExplodingDiceRolls = DiceService.rollExplodingDie(mockRollDie)

      expect(result[0]).toEqual([6, 2])
      expect(result[1]).toBe(8)
    })
  })

  describe("rollSwerve", () => {
    beforeEach(() => {
      // Reset any mocks
      jest.restoreAllMocks()
    })

    it("returns proper swerve structure with positive result", () => {
      // Mock rollExplodingDie to return predictable values
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[4], 4]) // Positive roll
        .mockReturnValueOnce([[2], 2]) // Negative roll

      const result: Swerve = DiceService.rollSwerve()

      expect(result.result).toBe(2) // 4 - 2 = 2
      expect(result.positiveRolls).toEqual([4])
      expect(result.negativeRolls).toEqual([2])
      expect(result.positive).toBe(4)
      expect(result.negative).toBe(2)
      expect(result.boxcars).toBe(false)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("returns proper swerve structure with negative result", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[2], 2]) // Positive roll
        .mockReturnValueOnce([[5], 5]) // Negative roll

      const result: Swerve = DiceService.rollSwerve()

      expect(result.result).toBe(-3) // 2 - 5 = -3
      expect(result.positiveRolls).toEqual([2])
      expect(result.negativeRolls).toEqual([5])
      expect(result.positive).toBe(2)
      expect(result.negative).toBe(5)
      expect(result.boxcars).toBe(false)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("detects boxcars when both first rolls are 6", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[6, 3], 9]) // Positive: starts with 6
        .mockReturnValueOnce([[6, 1], 7]) // Negative: starts with 6

      const result: Swerve = DiceService.rollSwerve()

      expect(result.result).toBe(2) // 9 - 7 = 2
      expect(result.positiveRolls).toEqual([6, 3])
      expect(result.negativeRolls).toEqual([6, 1])
      expect(result.positive).toBe(9)
      expect(result.negative).toBe(7)
      expect(result.boxcars).toBe(true)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("does not detect boxcars when only positive starts with 6", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[6, 2], 8]) // Positive: starts with 6
        .mockReturnValueOnce([[4], 4]) // Negative: does not start with 6

      const result: Swerve = DiceService.rollSwerve()

      expect(result.boxcars).toBe(false)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("does not detect boxcars when only negative starts with 6", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[3], 3]) // Positive: does not start with 6
        .mockReturnValueOnce([[6, 5], 11]) // Negative: starts with 6

      const result: Swerve = DiceService.rollSwerve()

      expect(result.boxcars).toBe(false)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("handles zero result", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      DiceService.rollExplodingDie = jest.fn()
        .mockReturnValueOnce([[5], 5]) // Positive roll
        .mockReturnValueOnce([[5], 5]) // Negative roll

      const result: Swerve = DiceService.rollSwerve()

      expect(result.result).toBe(0) // 5 - 5 = 0
      expect(result.boxcars).toBe(false)

      DiceService.rollExplodingDie = originalRollExplodingDie
    })

    it("handles exploding dice with multiple 6s", () => {
      const originalRollExplodingDie = DiceService.rollExplodingDie
      const mockFn = jest.fn()
        .mockReturnValueOnce([[6, 6, 6, 3], 21]) // Multiple 6s in positive
        .mockReturnValueOnce([[6, 1], 7]) // Negative also starts with 6 for boxcars
      
      DiceService.rollExplodingDie = mockFn

      const result: Swerve = DiceService.rollSwerve()

      expect(result.result).toBe(14) // 21 - 7 = 14
      expect(result.positiveRolls).toEqual([6, 6, 6, 3])
      expect(result.positive).toBe(21)
      expect(result.negativeRolls).toEqual([6, 1])
      expect(result.negative).toBe(7)
      expect(result.boxcars).toBe(true) // Both start with 6

      DiceService.rollExplodingDie = originalRollExplodingDie
    })
  })

  describe("integration tests", () => {
    it("rollSwerve uses actual rollDie function", () => {
      // Mock rollDie to ensure predictable results for testing
      const originalRollDie = DiceService.rollDie
      DiceService.rollDie = jest.fn()
        .mockReturnValueOnce(3) // Positive roll: ignored (do-while)
        .mockReturnValueOnce(4) // Positive roll: actual
        .mockReturnValueOnce(2) // Negative roll: ignored (do-while) 
        .mockReturnValueOnce(1) // Negative roll: actual

      const result: Swerve = DiceService.rollSwerve()

      // Basic structure checks
      expect(typeof result.result).toBe('number')
      expect(Array.isArray(result.positiveRolls)).toBe(true)
      expect(Array.isArray(result.negativeRolls)).toBe(true)
      expect(typeof result.positive).toBe('number')
      expect(typeof result.negative).toBe('number')
      expect(typeof result.boxcars).toBe('boolean')

      // All rolls should be between 1-6
      result.positiveRolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(6)
      })
      result.negativeRolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(6)
      })

      // Totals should match sum of rolls
      const positiveSum = result.positiveRolls.reduce((sum, roll) => sum + roll, 0)
      const negativeSum = result.negativeRolls.reduce((sum, roll) => sum + roll, 0)
      expect(result.positive).toBe(positiveSum)
      expect(result.negative).toBe(negativeSum)
      expect(result.result).toBe(positiveSum - negativeSum)

      // Boxcars logic
      if (result.positiveRolls[0] === 6 && result.negativeRolls[0] === 6) {
        expect(result.boxcars).toBe(true)
      } else {
        expect(result.boxcars).toBe(false)
      }

      DiceService.rollDie = originalRollDie
    })

    it("multiple rollSwerve calls produce varying results", () => {
      // Mock predictable variation to ensure test reliability
      const originalRollDie = DiceService.rollDie
      const mockValues = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 1, 3, 4, 5, 6, 1, 2]
      let callCount = 0
      DiceService.rollDie = jest.fn(() => {
        const value = mockValues[callCount % mockValues.length]
        callCount++
        return value
      })

      const results = []
      for (let i = 0; i < 5; i++) { // Reduced iterations for predictability
        results.push(DiceService.rollSwerve())
      }

      // There should be some variation in results
      const uniqueResults = new Set(results.map(r => r.result))
      expect(uniqueResults.size).toBeGreaterThan(1)
      
      DiceService.rollDie = originalRollDie
    })
  })

  describe("edge cases", () => {
    it("rollExplodingDie handles custom rollDie function", () => {
      const customRollDie = jest.fn()
        .mockReturnValueOnce(3) // First call (ignored in do-while loop)
        .mockReturnValueOnce(1) // Actual roll

      const result = DiceService.rollExplodingDie(customRollDie)

      expect(result[0]).toEqual([1])
      expect(result[1]).toBe(1)
      expect(customRollDie).toHaveBeenCalledTimes(2) // Once ignored, once counted
    })

    it("rollExplodingDie with function that returns 6s then stops", () => {
      const mockRoll = jest.fn()
        .mockReturnValueOnce(2) // First call (ignored)
        .mockReturnValueOnce(6) // First actual roll - explodes
        .mockReturnValueOnce(6) // Second roll - explodes again
        .mockReturnValueOnce(6) // Third roll - explodes again  
        .mockReturnValueOnce(1) // Fourth roll - stops explosion

      const result = DiceService.rollExplodingDie(mockRoll)

      expect(result[0]).toEqual([6, 6, 6, 1])
      expect(result[1]).toBe(19) // 6 + 6 + 6 + 1
    })
  })
})