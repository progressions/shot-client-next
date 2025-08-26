# Design Options for Schtick Display in Template Cards

## The Problem
- Players need to see what schticks DO, not just their names
- Each schtick has a name + description (potentially multi-paragraph)
- Cards need to show 3-5+ schticks
- Must balance information density with readability
- Cards are already tall with full character descriptions

## Option 1: Expandable/Collapsible Schticks
```
Schticks (Powers & Abilities)
▶ Lightning Reload               [Click to expand]
▶ Hair-Trigger Reflexes          
▼ Carnival of Carnage            [Expanded state]
  You can attack all enemies in sight with a 
  single action. Roll once, apply to all targets.
  Costs 2 Fortune points.
▶ Both Guns Blazing
```

**Pros**: Compact by default, full info on demand
**Cons**: Requires interaction, hides info initially

## Option 2: Tooltip/Hover Cards
```
Schticks (Powers & Abilities)
[Lightning Reload] [Hair-Trigger] [Carnival]
         ↑
    [on hover: floating card with full description]
```

**Pros**: Very compact, full info available
**Cons**: Not mobile-friendly, requires hover

## Option 3: Two-Column Layout with Condensed Descriptions
```
┌─────────────────────────────────┐
│ Schticks (Powers & Abilities)   │
├─────────────────────────────────┤
│ • Lightning Reload              │
│   Reload as a free action       │
│                                 │
│ • Hair-Trigger Reflexes        │
│   +1 to Initiative rolls       │
│                                 │
│ • Carnival of Carnage          │
│   Attack all enemies at once   │
└─────────────────────────────────┘
```

**Pros**: Shows key info for all
**Cons**: Very condensed descriptions

## Option 4: Dedicated Schticks Section (Current + First Line)
```
Schticks (Powers & Abilities)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lightning Reload
↳ Reload any gun as a free action once per sequence

Hair-Trigger Reflexes  
↳ Add +1 to all Initiative rolls and act first in ties

Carnival of Carnage
↳ Attack all visible enemies with a single action...
```

**Pros**: Shows name + key benefit
**Cons**: Still quite tall

## Option 5: Modal/Dialog Details
```
[View Full Details] button that opens a modal with:
- Complete schtick descriptions
- Weapon stats
- Full character background
```

**Pros**: Keeps cards compact
**Cons**: Extra click to see details

## Option 6: Tab-Based Card Content
```
┌─────────────────────────────────┐
│ [Stats] [Schticks] [Background] │ ← Tabs
├─────────────────────────────────┤
│ (Active tab content)            │
└─────────────────────────────────┘
```

**Pros**: Organizes info, user controls view
**Cons**: Can't see everything at once

## Option 7: Progressive Disclosure List
Show just names initially, but make each clickable inline:
```
Schticks (Powers & Abilities)
• Lightning Reload [+]
• Hair-Trigger Reflexes [-]
  Add +1 to all Initiative rolls. You always 
  act first when tied. Once per fight, you 
  may interrupt another character's action.
• Carnival of Carnage [+]
```

## Recommendation: Hybrid Approach

1. **For Template Selection**: Show schtick names + one-line summaries
2. **Add "Quick View" button**: Opens modal/drawer with full details
3. **Consider card size limit**: If over 600px tall, switch to compact mode
4. **Mobile**: Use expandable sections since hover won't work

```typescript
// Example implementation
<Box sx={{ mb: 2 }}>
  <Typography variant="overline">
    Schticks ({schticks.length})
  </Typography>
  
  {/* Compact view - always visible */}
  <Stack spacing={1}>
    {schticks.map(schtick => (
      <Box key={schtick.id}>
        <Typography variant="subtitle2">
          {schtick.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {schtick.description.substring(0, 60)}...
        </Typography>
      </Box>
    ))}
  </Stack>
  
  {/* Details button */}
  <Button 
    size="small" 
    onClick={handleOpenDetails}
    sx={{ mt: 1 }}
  >
    View Full Details
  </Button>
</Box>
```

## Alternative: Side-by-Side Layout
For desktop, show selected template details in a sidebar:
```
[Grid of Cards] | [Selected Template Details]
                |  Full schtick descriptions
                |  All weapons
                |  Complete background
```

This keeps cards scannable while providing full info for the focused template.