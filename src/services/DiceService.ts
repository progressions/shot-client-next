import type { Swerve, ExplodingDiceRolls } from "@/types"

const DiceService = {
  // @ts-expect-error This will be used one day
  rollDie: function (): number {
    const result = Math.floor(Math.random() * 6) + 1
    return result
  },

  rollExplodingDie: function (rollDie: () => number): ExplodingDiceRolls {
    let result = rollDie()
    const total = []
    do {
      result = rollDie()
      total.push(result)
    } while (result == 6)

    return [
      total,
      total.reduce((sum, number_) => {
        return sum + number_
      }, 0),
    ]
  },

  rollSwerve: function (): Swerve {
    const [positiveRolls, positive] = this.rollExplodingDie(this.rollDie)
    const [negativeRolls, negative] = this.rollExplodingDie(this.rollDie)

    const result = positive - negative

    const boxcars = positiveRolls[0] === 6 && negativeRolls[0] === 6

    return { result, positiveRolls, negativeRolls, positive, negative, boxcars }
  },
}

export default DiceService
