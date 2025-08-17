# WebSocket Updates Architecture

This document describes the centralized WebSocket update system implemented for real-time collaborative editing in the Chi War application.

## Overview

The system provides real-time synchronization of entity data across multiple browser tabs/users through a centralized entity subscription callback pattern in `AppContext`. This replaces the previous scattered approach where individual components handled `campaignData` updates directly.

## Architecture Components

### 1. Backend - Rails ActionCable Broadcasting

#### Broadcastable Concern
All entities that need real-time updates include the `Broadcastable` concern:

```ruby
module Broadcastable
  extend ActiveSupport::Concern

  included do
    after_commit :broadcast_campaign_update, on: [:create, :update]
    after_destroy :broadcast_reload
  end

  def broadcast_campaign_update
    BroadcastCampaignUpdateJob.perform_later(self.class.name, id)
  end
end
```

#### BroadcastCampaignUpdateJob
Handles the actual WebSocket broadcasting:

```ruby
class BroadcastCampaignUpdateJob < ApplicationJob
  def perform(entity_class, entity_id)
    entity = entity_class.constantize.find(entity_id)
    
    # Clear image URL cache if entity has images
    if entity.respond_to?(:clear_image_url_cache)
      entity.send(:clear_image_url_cache)
    end

    channel = "campaign_#{entity.campaign_id}"
    payload = { entity.class.name.underscore => "#{entity_class}Serializer".constantize.new(entity).serializable_hash }

    ActionCable.server.broadcast(channel, payload)
    ActionCable.server.broadcast(channel, { entity.class.name.downcase.pluralize => "reload" })
  end
end
```

#### Controller Considerations
For special cases (like image-only updates), controllers may need to manually broadcast to avoid timing issues:

```ruby
# For image-only updates, manually update timestamp without triggering callbacks
@character.update_column(:updated_at, Time.current)
# Manually broadcast the same character instance that we'll return in the response
channel = "campaign_#{@character.campaign_id}"
payload = { "character" => CharacterSerializer.new(@character).serializable_hash }
ActionCable.server.broadcast(channel, payload)
```

### 2. Frontend - Centralized Entity Subscriptions

#### AppContext Entity Callback System
The `AppContext` manages all WebSocket subscriptions and provides an entity callback registration system:

```typescript
// Entity update callback type
type EntityUpdateCallback = (entity: any) => void

// Callback registry
const entityUpdateCallbacks = useRef<Map<string, Set<EntityUpdateCallback>>>(new Map())

// Subscription function
const subscribeToEntity = useCallback((entityType: string, callback: EntityUpdateCallback) => {
  if (!entityUpdateCallbacks.current.has(entityType)) {
    entityUpdateCallbacks.current.set(entityType, new Set())
  }
  entityUpdateCallbacks.current.get(entityType)!.add(callback)
  
  return () => {
    entityUpdateCallbacks.current.get(entityType)?.delete(callback)
    if (entityUpdateCallbacks.current.get(entityType)?.size === 0) {
      entityUpdateCallbacks.current.delete(entityType)
    }
  }
}, [])
```

#### WebSocket Data Processing
When WebSocket data is received, it triggers registered callbacks:

```typescript
useEffect(() => {
  if (!campaignData) return
  
  Object.entries(campaignData).forEach(([key, value]) => {
    const callbacks = entityUpdateCallbacks.current.get(key)
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error(`Error in ${key} callback:`, error)
        }
      })
    }
  })
}, [campaignData])
```

#### Component Integration
Components subscribe to entity updates using the provided hook:

```typescript
// In character Show component
useEffect(() => {
  const unsubscribe = subscribeToEntity("character", (data) => {
    if (data && data.id === initialCharacter.id) {
      setCharacter(data)
    }
  })
  return unsubscribe
}, [subscribeToEntity, initialCharacter.id])
```

## Implementation Guide for New Entities

### Step 1: Backend Setup

1. **Ensure Entity Includes Broadcastable**
   ```ruby
   class YourEntity < ApplicationRecord
     include Broadcastable
     # ... rest of model
   end
   ```

2. **Create/Update Serializer**
   ```ruby
   class YourEntitySerializer < ActiveModel::Serializer
     attributes :id, :name, :created_at, :updated_at, :entity_class
     # ... other attributes
     
     def entity_class
       object.class.name
     end
   end
   ```

3. **Handle Special Cases in Controller**
   For operations that don't trigger standard model updates (like image uploads), manually broadcast:
   ```ruby
   # After special operation
   channel = "campaign_#{@entity.campaign_id}"
   payload = { "your_entity" => YourEntitySerializer.new(@entity).serializable_hash }
   ActionCable.server.broadcast(channel, payload)
   ```

### Step 2: Frontend Integration

1. **Component Subscription**
   ```typescript
   import { useAppContext } from "@/contexts"
   
   export default function YourEntityShow({ initialEntity }: Props) {
     const { subscribeToEntity } = useAppContext()
     const [entity, setEntity] = useState(initialEntity)
     
     useEffect(() => {
       const unsubscribe = subscribeToEntity("your_entity", (data) => {
         if (data && data.id === initialEntity.id) {
           setEntity(data)
         }
       })
       return unsubscribe
     }, [subscribeToEntity, initialEntity.id])
     
     // ... rest of component
   }
   ```

2. **List Component Subscription** 
   ```typescript
   export default function YourEntityList() {
     const { subscribeToEntity } = useAppContext()
     const [entities, setEntities] = useState([])
     
     useEffect(() => {
       const unsubscribe = subscribeToEntity("your_entities", () => {
         // Refresh the list when entities are updated
         refetchEntities()
       })
       return unsubscribe
     }, [subscribeToEntity])
     
     // ... rest of component
   }
   ```

3. **Form Component Integration**
   Ensure form components properly sync with prop changes:
   ```typescript
   // For dropdown/select components
   useEffect(() => {
     setLocalValue(propValue)
   }, [propValue])
   
   // For rich text editors
   useEffect(() => {
     if (editor && editor.getHTML() !== value && value !== undefined) {
       editor.commands.setContent(value || "")
     }
   }, [value, editor])
   ```

## Key Benefits

1. **Centralized Management**: All WebSocket logic lives in `AppContext`
2. **Component Isolation**: Components only need to register callbacks, no WebSocket handling
3. **Type Safety**: Callback system is fully typed
4. **Memory Efficiency**: Automatic cleanup when components unmount
5. **Error Handling**: Centralized error handling for callback execution
6. **Real-time Collaboration**: Instant updates across all browser tabs/users

## Common Patterns

### Individual Entity Updates
Use the singular entity name (e.g., "character", "vehicle", "fight"):
```typescript
subscribeToEntity("character", (updatedCharacter) => {
  if (updatedCharacter.id === currentCharacter.id) {
    setCharacter(updatedCharacter)
  }
})
```

### List Refresh Updates  
Use the plural entity name (e.g., "characters", "vehicles", "fights"):
```typescript
subscribeToEntity("characters", () => {
  // Refresh the entire list
  refetchCharacters()
})
```

### Form Field Synchronization
Ensure all form components sync with WebSocket updates:
```typescript
// Standard pattern for form fields
useEffect(() => {
  setLocalFieldValue(entity.fieldValue)
}, [entity.fieldValue])
```

## Troubleshooting

### Common Issues

1. **Updates Not Appearing**: 
   - Check that entity includes `Broadcastable` concern
   - Verify serializer exists and includes all needed attributes
   - Ensure component is subscribed to correct entity type name

2. **Multiple Conflicting Updates**: 
   - Check for duplicate broadcasts (automatic + manual)
   - Use `update_column` instead of `touch` to avoid triggering callbacks when manually broadcasting

3. **Form Fields Not Syncing**:
   - Add `useEffect` to sync local state with prop changes
   - For rich text editors, ensure proper editor instance access

4. **Image URLs Showing as `null`**:
   - Ensure image URL cache is cleared before broadcasting
   - Use manual broadcast for image-only updates to avoid timing issues

### Debugging

Add temporary logging to understand the flow:
```typescript
// In AppContext
console.log("WebSocket received:", { key, entityData: value })

// In components  
console.log("Entity updated via subscription:", updatedEntity)
```

Remember to remove debugging logs before committing!

## Migration from Old Pattern

To migrate existing components from direct `campaignData` handling:

1. **Remove `campaignData` dependencies**:
   ```typescript
   // Remove this
   const { campaignData } = useAppContext()
   useEffect(() => {
     // Process campaignData.entity
   }, [campaignData])
   ```

2. **Add entity subscription**:
   ```typescript
   // Add this
   const { subscribeToEntity } = useAppContext()
   useEffect(() => {
     const unsubscribe = subscribeToEntity("entity", handleEntityUpdate)
     return unsubscribe
   }, [subscribeToEntity])
   ```

3. **Update form components** to sync with prop changes using `useEffect`

This architecture provides a robust foundation for real-time collaborative editing that can easily be extended to any entity in the system.