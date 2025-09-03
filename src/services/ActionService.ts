import type { AttackState } from "@/reducers/attackState"
import DS from "@/services/DiceService"
import { AttackRoll, Swerve } from "@/types/types"

const verbose = false

const ActionService = {
  totalWounds: function({ attackRolls, toughness }: { attackRolls: any[], toughness: number }): number {
    return attackRolls.reduce((total: number, attackRoll: any) => {
      return total + (attackRoll.wounds || 0)
    }, 0)
  },

  attacks: function({ count, swerve, actionValue, defense, stunt, damage, toughness }: { count: number, swerve?: Swerve, actionValue: number, defense: number, stunt?: boolean, damage: number, toughness: number }): AttackRoll[] {
    const attacks = []
    for (let i = 0; i < count; i++) {
      attacks.push(this.wounds({ swerve, actionValue, defense, stunt, damage, toughness }))
    }
    return attacks
  },

  wounds: function({ swerve, actionValue, defense, stunt, damage, toughness }: { swerve?: Swerve, actionValue: number, defense: number, stunt?: boolean, damage: number, toughness: number }): AttackRoll {
    const smackdown = this.smackdown({ swerve, actionValue, defense, stunt, damage })
    const wounds = Math.max(0, (smackdown.smackdown || 0) - toughness)
    if (verbose) {
      console.log(`Wounds ${wounds} : Smackdown ${smackdown.smackdown} - Toughness ${toughness}`)
    }
    return {
      ...smackdown,
      wounds,
    }
  },

  smackdown: function({ swerve, actionValue, defense, stunt, damage }: { swerve?: Swerve, actionValue: number, defense: number, stunt?: boolean, damage: number }): AttackRoll {
    const outcome = this.outcome({ swerve, actionValue, defense, stunt })
    const smackdown = outcome.success ? (outcome.outcome || 0) + (damage || 0) : 0
    if (verbose) {
      console.log(`Smackdown ${smackdown} : Outcome ${outcome.outcome} + Damage ${damage || 0}`)
    }
    return {
      ...outcome,
      smackdown,
    }
  },

  outcome: function({ swerve, actionValue, defense, stunt }: { swerve?: Swerve, actionValue: number, defense: number, stunt?: boolean }): AttackRoll {
    const actionResult = this.actionResult({ swerve, actionValue })
    const modifiedDefense = stunt ? defense + 2 : defense
    const outcome = actionResult.actionResult - modifiedDefense
    const success = outcome >= 0
    if (verbose) {
      console.log(`Outcome ${outcome} : ActionResult ${actionResult.actionResult} - Defense ${modifiedDefense}${stunt ? "*" : ""}`)
    }
    return {
      ...actionResult,
      outcome,
      success,
      wayAwfulFailure: actionResult.wayAwfulFailure || (actionResult.boxcars && outcome < 0)
    }
  },

  actionResult: function({ swerve, actionValue }: { swerve?: Swerve, actionValue: number }): AttackRoll {
    const rolledSwerve = swerve === undefined ? this.swerve() : swerve
    const result = actionValue + rolledSwerve.result
    if (verbose) {
      console.log(`ActionResult ${result} : Swerve ${rolledSwerve.result} + ActionValue ${actionValue}`)
    }
    return {
      boxcars: rolledSwerve.boxcars,
      swerve: rolledSwerve.result,
      actionResult: result,
      wayAwfulFailure: result < 0
    }
  },

  // { result, positiveRolls, negativeRolls, positive, negative, boxcars }
  swerve: function(): Swerve {
    const swerve = DS.rollSwerve()
    // console.log("Rolling swerve", swerve)
    return swerve
  }
}

export default ActionService
