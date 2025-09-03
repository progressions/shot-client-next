import type { Position, Fight, Character, Vehicle } from "@/types/types"
import AS from "@/services/ActionService"
import VS from "@/services/VehicleService"
import { ChaseMookResult, ChaseMethod, ChaseFormData } from "@/types/chase"
import { parseToNumber } from "@/lib/parseToNumber"

const ChaseReducerService = {
  // change the "edited" flag to true to roll the attack and
  // calculate the results.
  process: function(state: ChaseFormData): ChaseFormData {
    let st = this.convertToNumber(state)

    if (st.edited) {
      // roll attacks for all mooks
      if (this.VS.isMook(st.attacker)) return this.resolveMookAttacks(st)

      // roll the attack and apply the attack results
      return this.resolveAttack(st)
    }

    return st
  },

  // Resolve the attack roll from a single attack, and apply the
  // results to the target and the attacker.
  //
  // If the target is a Mook, and the attacker is not, call killMooks.
  //
  // For a Ram/Sideswipe, the attacker uses their Crunch to apply damage, and the
  // Target uses their Frame to resist damage.
  //
  // If the target's Frame is higher than the attacker's Frame, the Attacker will
  // take a Bump of damage to its Chase Points and Condition Points.
  //
  resolveAttack: function(state: ChaseFormData): ChaseFormData {
    const st = this.calculateAttackValues(state)
    if (this.VS.isMook(state.target)) return this.killMooks(st)

    const { method, attacker, smackdown, target } = st
    const beforeChasePoints = this.VS.chasePoints(target)
    const beforeConditionPoints = this.VS.conditionPoints(target)

    const [updatedAttacker, updatedTarget] = this.processMethod(st, smackdown as number)

    const afterChasePoints = this.VS.chasePoints(updatedTarget)
    const afterConditionPoints = this.VS.conditionPoints(updatedTarget)

    return {
      ...st,
      chasePoints: afterChasePoints - beforeChasePoints,
      conditionPoints: afterConditionPoints - beforeConditionPoints,
      attacker: updatedAttacker,
      target: updatedTarget,
    }
  },

  // roll the dice for a single attack
  calculateAttackValues: function(st: ChaseFormData): ChaseFormData {
    if (st.typedSwerve !== "") {
      st.swerve = { ...st.swerve, result: parseToNumber(st.typedSwerve) }
    }

    st.modifiedDefense = this.R.defenseString(st)
    st.modifiedActionValue = this.R.mainAttackString(st)
    st.mookDefense = this.R.targetMookDefense(st)

    return this.VS.isPursuer(st.attacker) ? this.pursue(st) : this.evade(st)
  },

  // If the attack is a success, return the number of Chase Points to apply to the target
  // return the position 'near'.
  pursue: function(st: ChaseFormData): ChaseFormData {
    // Calculate the basic attack outcome (Driving + Swerve vs Target's Driving)
    const { success, actionResult, outcome, wayAwfulFailure } = this.AS.outcome({
      swerve: st.swerve,
      actionValue: st.actionValue,
      defense: st.mookDefense,
      stunt: st.stunt,
    })

    if (success) {
      // For chase rules: Chase Points = Outcome + Attacker's Squeal - Target's Handling
      // For ram/sideswipe: use Crunch - Frame instead
      let chasePoints: number
      let conditionPoints: number | null = null
      
      if (st.method === ChaseMethod.RAM_SIDESWIPE) {
        // Ram/Sideswipe: Outcome + Attacker's Crunch - Target's Frame
        // Note: Frame is still calculated from vehicle as it's not editable
        const targetFrame = this.VS.isMook(st.target) ? 0 : this.VS.frame(st.target)
        chasePoints = Math.max(0, (outcome || 0) + st.crunch - targetFrame)
        conditionPoints = chasePoints
      } else {
        // Other methods: Outcome + Attacker's Squeal - Target's Handling
        // Use the handling value from form state (which can be manually edited)
        chasePoints = Math.max(0, (outcome || 0) + st.squeal - st.handling)
      }

      return {
        ...st,
        success: true,
        actionResult: actionResult,
        outcome: outcome || null,
        smackdown: null,
        position: "near",
        chasePoints: chasePoints,
        conditionPoints: conditionPoints,
        boxcars: st.swerve.boxcars,
        wayAwfulFailure: wayAwfulFailure,
      }
    }
    // if success is false, the target is not hit and the position remains the same
    return {
      ...st,
      success: false,
      actionResult: actionResult,
      outcome: outcome || null,
      smackdown: null,
      chasePoints: null,
      conditionPoints: null,
      boxcars: st.swerve.boxcars,
      wayAwfulFailure: wayAwfulFailure,
    }
  },

  // If the attack is a success, apply Chase Points to the Target and
  // return the position 'far'.
  evade: function(st: ChaseFormData): ChaseFormData {
    // Calculate the basic attack outcome (Driving + Swerve vs Target's Driving)
    const { success, actionResult, outcome, wayAwfulFailure } = this.AS.outcome({
      swerve: st.swerve,
      actionValue: st.actionValue,
      defense: st.mookDefense,
      stunt: st.stunt,
    })

    if (success) {
      // For evade actions: Chase Points = Outcome + Attacker's Squeal - Target's Handling
      // Use the handling value from form state (which can be manually edited)
      const chasePoints = Math.max(0, (outcome || 0) + st.squeal - st.handling)
      
      return {
        ...st,
        success: true,
        position: "far",
        actionResult: actionResult,
        outcome: outcome || null,
        smackdown: null,
        chasePoints: chasePoints,
        conditionPoints: null,
        boxcars: st.swerve.boxcars,
        wayAwfulFailure: wayAwfulFailure,
      }
    }
    // if success is false, the target is not hit and the position remains the same
    return {
      ...st,
      success: false,
      actionResult: actionResult,
      outcome: outcome || null,
      smackdown: null,
      chasePoints: null,
      conditionPoints: null,
      boxcars: st.swerve.boxcars,
      wayAwfulFailure: wayAwfulFailure,
    }
  },

  rollMookAttacks: function(st: ChaseFormData): ChaseFormData {
    const results:ChaseMookResult[] = []
    let chasePoints = 0
    let conditionPoints = 0
    let success = st.success

    for (let i = 0; i < st.count; i++) {
      const swerve = this.AS.swerve()
      const result = this.calculateAttackValues({
        ...st,
        swerve: swerve,
        typedSwerve: "",
      })

      chasePoints += result.chasePoints as number
      conditionPoints += result.conditionPoints as number
      success ||= result.success

      results.push({
        actionResult: result.actionResult,
        success: result.success,
        smackdown: result.smackdown as number,
        chasePoints: result.chasePoints as number,
        conditionPoints: result.conditionPoints as number,
      })
    }

    return {
      ...st,
      chasePoints: chasePoints as number,
      conditionPoints: conditionPoints as number,
      success: success,
      mookResults: results,
    }
  },

  // For each attack roll in the `mookRolls` array, apply the attack
  // to the target and calculate the net Chase Points and Condition Points.
  //
  // This version ignores the position and bump rules.
  //
  resolveMookAttacks: function(state: ChaseFormData): ChaseFormData {
    const results:ChaseMookResult[] = []
    const st = this.rollMookAttacks(state)

    // apply changes to the attacker and target based on the method
    // but don't add Chase Points
    let [attacker, target] = this.processMethod(st, 0)

    if (st.success) {
      target = VS.takeRawChasePoints(target, st.chasePoints || 0)
    }
    if (st.success && st.method === ChaseMethod.RAM_SIDESWIPE) {
      target = VS.takeRawConditionPoints(target, st.conditionPoints || 0)
    }

    return {
      ...st,
      attacker: attacker,
      target: target
    }
  },

  // Remove a number of mooks if the attack was successful, factoring in any
  // changes to the position of the attacker or target based on the method.
  killMooks: function(st: ChaseFormData): ChaseFormData {
    if (!st.success) return st

    // We send st.count explicitly here because processMethod lets us
    // choose whether to use count or smackdown, depending on whether
    // we're attacking mooks or not.
    const [updatedAttacker, updatedTarget] = this.processMethod(st, st.count)

    return {
      ...st,
      attacker: updatedAttacker,
      target: updatedTarget
    }
  },

  /*
   * If the attacker is sideswiping the target, there is a chance that the
   * attacker and target will both take some Chase Points and Condition Points.
   * Sideswiping uses Crunch as the damage value and Frame as defense.
   *
   * If the attacker is trying to widen the gap, a sucessful result will
   * change the attacker's and the target's positions to 'far'. It uses Squeal
   * as the damage value and Handling as defense.
   *
   * If the attacker is trying to narrow the gap, a sucessful result will
   * change the attacker's and the target's positions to 'near'. It uses Squeal
   * as the damage value and Handling as defense.
   *
   * If the attacker is trying to evade, a sucessful result doesn't change
   * the attacker's and target's positions, both are assumed to be 'far'. It
   * uses Squeal as the damage value and Handling as defense.
   *
   */
  processMethod: function(state: ChaseFormData, damage: number): [Vehicle, Vehicle] {
    if (!state.success) return [state.attacker, state.target]

    const { method, attacker, target } = state

    switch (method) {
      case ChaseMethod.RAM_SIDESWIPE:
        return this.VS.ramSideswipe(attacker, damage, target)
      case ChaseMethod.WIDEN_THE_GAP:
        return this.VS.widenTheGap(attacker, damage, target)
      case ChaseMethod.NARROW_THE_GAP:
        return this.VS.narrowTheGap(attacker, damage, target)
      case ChaseMethod.EVADE:
        return this.VS.evade(attacker, damage, target)
    }
    return [attacker, target]
  },

  setAttacker: function(state: ChaseFormData, attacker: Vehicle): ChaseFormData {
    return this.process({
      ...state,
      attacker: attacker,
      actionValue: this.VS.mainAttackValue(attacker),
      handling: this.VS.handling(attacker),
      squeal: this.VS.squeal(attacker),
      frame: this.VS.frame(attacker),
      crunch: this.VS.crunch(attacker),
      count: this.VS.isMook(attacker) ? this.VS.mooks(attacker) : 1,
      position: this.VS.position(attacker),
      impairments: this.VS.impairments(attacker),
      method: this.R.defaultMethod(attacker) as ChaseMethod,
    })
  },

  setTarget: function(state: ChaseFormData, target: Vehicle): ChaseFormData {
    return this.process({
      ...state,
      target: target,
      defense: this.VS.defense(target),
      handling: this.VS.isMook(target) ? 0 : this.VS.handling(target),
      frame: this.VS.isMook(target) ? 0 : this.VS.frame(target),
    })
  },

  /* These functions return values but don't make any changes */
  R: {
    defenseString: function(st: ChaseFormData): string {
      if (st.stunt) {
        return `${st.defense + 2}*`
      } else if (this.VS.impairments(st.target) > 0) {
        return `${st.defense}*`
      }
      return `${st.defense}`
    },

    mainAttackString: function(st: ChaseFormData): string {
      return `${st.actionValue}`
    },

    targetMookDefense: function(st: ChaseFormData): number {
      if (this.VS.isMook(st.target) && st.count > 1) {
        return st.defense + st.count
      }
      return st.defense
    },

    calculateToughness: function(st: ChaseFormData): number {
      switch (st.method) {
        case ChaseMethod.RAM_SIDESWIPE:
          return st.frame
        default:
          return st.handling
      }
    },

    calculateDamage: function(st: ChaseFormData): number {
      switch (st.method) {
        case ChaseMethod.RAM_SIDESWIPE:
          return st.crunch
        default:
          return st.squeal
      }
    },

    defaultMethod: function(attacker: Vehicle): string {
      if (this.VS.isPursuer(attacker) && VS.isNear(attacker)) return ChaseMethod.RAM_SIDESWIPE
      if (this.VS.isPursuer(attacker) && VS.isFar(attacker)) return ChaseMethod.NARROW_THE_GAP
      if (this.VS.isEvader(attacker) && VS.isNear(attacker)) return ChaseMethod.WIDEN_THE_GAP
      return ChaseMethod.EVADE
    },

    // inject these dependencies so we can mock them in tests
    AS: AS,
    VS: VS,
  },

  /* These functions make changes to the state. The forms give us strings, but
  *  we need number values. */
  convertToNumber: function(state: ChaseFormData): ChaseFormData {
    return {
      ...state,
      swerve: {
        ...state.swerve,
        result: parseToNumber(state.swerve.result),
      },
      actionValue: parseToNumber(state.actionValue),
      handling: parseToNumber(state.handling),
      squeal: parseToNumber(state.squeal),
      frame: parseToNumber(state.frame),
      crunch: parseToNumber(state.crunch),
      count: parseToNumber(state.count),
      defense: parseToNumber(state.defense),
    }
  },

  // inject these dependencies so we can mock them in tests
  AS: AS,
  VS: VS,
}

export default ChaseReducerService
