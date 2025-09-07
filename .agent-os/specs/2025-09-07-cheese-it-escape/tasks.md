# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-07-cheese-it-escape/spec.md

> Created: 2025-09-07
> Status: Ready for Implementation

## Tasks

- [ ] 1. Extend Backend CombatActionService to Support Status Updates
  - [ ] 1.1 Write tests for add_status and remove_status in character_updates payload
  - [ ] 1.2 Add support for add_status field in apply_character_update method
  - [ ] 1.3 Add support for remove_status field in apply_character_update method
  - [ ] 1.4 Test status updates work correctly for both PC and NPC characters
  - [ ] 1.5 Verify all tests pass

- [ ] 2. Add Cheese It Button and Panel to Frontend Action Bar
  - [ ] 2.1 Add "Cheese It" button to Action Bar component
  - [ ] 2.2 Create CheeseItPanel component for initiating escape
  - [ ] 2.3 Implement character status update to add "cheesing_it" with shot cost deduction
  - [ ] 2.4 Add visual indicator for characters with "cheesing_it" status
  - [ ] 2.5 Add visual indicator for characters with "cheesed_it" status

- [ ] 3. Create Prevent Escape Panel and Speed Check UI
  - [ ] 3.1 Add "Prevent Escape" button that appears for eligible characters
  - [ ] 3.2 Create PreventEscapePanel component with Swerve NumberField
  - [ ] 3.3 Add optional Fortune NumberField for PC characters
  - [ ] 3.4 Implement Speed check calculation (Speed + Swerve + Fortune >= Target Speed)
  - [ ] 3.5 Add Resolve button that sends result to backend via apply_combat_action

- [ ] 4. Implement Prevention Logic and Status Transitions
  - [ ] 4.1 Handle successful prevention (remove "cheesing_it" status)
  - [ ] 4.2 Handle failed prevention (change "cheesing_it" to "cheesed_it")
  - [ ] 4.3 Implement one-attempt-only restriction per escape
  - [ ] 4.4 Add fight events for escape attempts and prevention results
  - [ ] 4.5 Test complete escape flow with multiple characters

- [ ] 5. End-to-End Testing and Polish
  - [ ] 5.1 Write Playwright test for complete escape scenario
  - [ ] 5.2 Test Boss/Uber-Boss 2-shot cost vs standard 3-shot cost
  - [ ] 5.3 Verify WebSocket broadcasts update all connected clients
  - [ ] 5.4 Add appropriate toast notifications for escape actions
  - [ ] 5.5 Verify all unit and integration tests pass