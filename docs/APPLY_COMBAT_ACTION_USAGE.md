# `client.applyCombatAction` Usage

This document details the usage of the `client.applyCombatAction` method within the `shot-client-next` application, specifically in the `src/components/encounters` directory. This method is the primary way the client sends combat-related updates to the server.

## Method Signature

```typescript
client.applyCombatAction(encounter: Encounter, characterUpdates: CharacterUpdate[]): Promise<void>
```

-   `encounter`: The current encounter object.
-   `characterUpdates`: An array of `CharacterUpdate` objects, where each object represents a single update to a character or vehicle in the fight.

## Usage Examples

### 1. `CheeseItPanel.tsx`

-   **Context:** This panel is used when a character attempts to "cheese it" (escape) from a fight.
-   **Description:** A single `characterUpdate` object is created for the character who is attempting to escape. The update includes the new shot value, a status to add (`cheesing_it`), and a `FightEvent` to log the action.
-   **Payload Example:**

    ```json
    [
      {
        "shot_id": "some-shot-id",
        "character_id": "some-character-id",
        "shot": 10,
        "add_status": ["cheesing_it"],
        "event": {
          "type": "escape_attempt",
          "description": "Character Name is attempting to cheese it!",
          "details": {
            "character_id": "some-character-id",
            "shot_cost": 3,
            "old_shot": 13,
            "new_shot": 10
          }
        }
      }
    ]
    ```

### 2. `HealPanel.tsx`

-   **Context:** This panel is used when one character heals another.
-   **Description:** Two `characterUpdate` objects are created: one for the healer and one for the target. The healer's update includes the new shot value (after spending shots) and potentially a change in `action_values` if they spent Fortune. The target's update includes the new wound count.
-   **Payload Example:**

    ```json
    [
      {
        "shot_id": "healer-shot-id",
        "character_id": "healer-character-id",
        "shot": 8,
        "event": {
          "type": "heal",
          "description": "Healer Name healed Target Name for 10 wounds",
          "details": {
            "healer_id": "healer-character-id",
            "target_id": "target-character-id",
            "medicine_skill": 12,
            "swerve": -2,
            "healing": 10,
            "shot_cost": 5,
            "fortune_used": false
          }
        }
      },
      {
        "shot_id": "target-shot-id",
        "character_id": "target-character-id",
        "action_values": {
          "Wounds": 25
        }
      }
    ]
    ```

### 3. `SpeedCheckPanel.tsx`

-   **Context:** This panel is used when a character attempts to prevent another character from escaping.
-   **Description:** A `characterUpdates` array is created with updates for both the preventer and the escaper. The preventer's update includes their new shot position and potentially a change in Fortune. The escaper's update includes the removal of the `cheesing_it` status and the addition of the `cheesed_it` status if the escape is successful.
-   **Payload Example (Successful Prevention):**

    ```json
    [
      {
        "shot_id": "preventer-shot-id",
        "character_id": "preventer-character-id",
        "shot": 10,
        "event": {
          "type": "speed_check_attempt",
          "description": "Preventer Name spends 3 shots on Speed Check",
          "details": {
            "character_id": "preventer-character-id",
            "shot_cost": 3,
            "old_shot": 13,
            "new_shot": 10
          }
        }
      },
      {
        "character_id": "escaper-character-id",
        "remove_status": ["cheesing_it"],
        "event": {
          "type": "escape_prevented",
          "description": "Preventer Name prevents Escaper Name from escaping!",
          "details": {
            "preventer_id": "preventer-character-id",
            "escapee_id": "escaper-character-id",
            "roll": 12,
            "swerve": 2,
            "fortune_bonus": 0,
            "shot_cost": 3,
            "difficulty": 10,
            "success": true
          }
        }
      }
    ]
    ```

### 4. `attacks/attackHandlers.ts`

-   **Context:** This file contains the logic for handling all types of attacks.
-   **Description:** This is the most complex usage of `client.applyCombatAction`. The `characterUpdates` array can contain multiple updates for the attacker and each target. The updates can include shot changes, wound changes, status changes, and impairments.
-   **Payload Example (Non-Mook Attacker, Multiple Targets):**

    ```json
    [
      {
        "shot_id": "attacker-shot-id",
        "character_id": "attacker-character-id",
        "shot": 7,
        "action_values": {
          "Fortune": 4
        }
      },
      {
        "shot_id": "target-1-shot-id",
        "character_id": "target-1-character-id",
        "shot": 9,
        "action_values": {
          "Fortune": 2
        }
      },
      {
        "shot_id": "target-2-shot-id",
        "character_id": "target-2-character-id",
        "action_values": {
          "Wounds": 40
        },
        "impairments": 2,
        "event": {
          "type": "wound",
          "description": "Attacker Name dealt 15 wounds to Target 2 Name",
          "details": {
            "attacker_id": "attacker-character-id",
            "target_id": "target-2-character-id",
            "wounds": 15,
            "attackValue": 15,
            "defenseValue": 10,
            "swerve": 0,
            "weaponDamage": 10,
            "shotCost": 3,
            "stunt": false,
            "defenseChoice": "none"
          }
        }
      }
    ]
    ```
