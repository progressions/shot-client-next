import type {
  User,
  Vehicle,
  Character,
  CharacterEffect,
  Encounter,
  Shot,
} from "@/types"
import CS from "@/services/CharacterService"

const FightService = {
  currentShot: function (encounter: Encounter): number {
    if (!encounter?.shots || encounter.shots.length === 0) return 0
    return encounter.shots[0].shot || 0
  },

  users: function (encounter: Encounter): User[] {
    if (!encounter?.id || !encounter?.shots) {
      return []
    }

    const users: User[] = []
    encounter.shots.forEach((shot: Shot) => {
      shot.characters.forEach((char: Character) => {
        if (
          CS.isPC(char) &&
          char?.user &&
          !users.some(u => u?.id === char?.user?.id)
        ) {
          users.push(char.user)
        }
      })
    })
    return users
  },

  firstUp: function (encounter: Encounter): Character | Vehicle | undefined {
    if (!encounter?.shots || encounter.shots.length === 0) return undefined
    const firstShot = encounter.shots[0]
    return firstShot.characters[0] || firstShot.vehicles[0]
  },

  playerCharactersForInitiative: function (encounter: Encounter): Character[] {
    return this.playerCharacters(encounter).filter(character => {
      if (CS.hidden(character)) return false
      const shot = character.current_shot as number
      return shot <= 0
    })
  },

  playerCharacters: function (encounter: Encounter): Character[] {
    if (!encounter?.shots) return []

    const characters: Character[] = []
    encounter.shots.forEach((shot: Shot) => {
      shot.characters.forEach((character: Character) => {
        if (CS.isPC(character)) {
          characters.push(character)
        }
      })
    })
    return characters
  },

  charactersInFight: function (encounter: Encounter): Character[] {
    if (!encounter?.shots) return []

    const characters: Character[] = []
    encounter.shots.forEach((shot: Shot) => {
      shot.characters.forEach((character: Character) => {
        characters.push(character)
      })
    })
    return characters
  },

  vehiclesInFight: function (encounter: Encounter): Vehicle[] {
    if (!encounter?.shots) return []

    const vehicles: Vehicle[] = []
    encounter.shots.forEach((shot: Shot) => {
      shot.vehicles.forEach((vehicle: Vehicle) => {
        vehicles.push(vehicle)
      })
    })
    return vehicles
  },

  startOfSequence: function (encounter: Encounter): boolean {
    return this.currentShot(encounter) === 0
  },

  characterEffects: function (
    encounter: Encounter,
    character: Character
  ): CharacterEffect[] {
    // In the new structure, effects are attached directly to each character
    // Find the character in the encounter and return their effects
    if (!encounter?.shots) return []

    for (const shot of encounter.shots) {
      const foundChar = shot.characters.find(
        c => c.shot_id === character.shot_id
      )
      if (foundChar) {
        return foundChar.effects || []
      }
    }
    return []
  },
}

export default FightService
