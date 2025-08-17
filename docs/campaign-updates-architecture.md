# Campaign Updates Architecture Options

## Current State
Currently, WebSocket updates from Rails (via the `Broadcastable` concern) are handled individually in each component:
- Components use `useCampaign()` to access `campaignData`
- Each component has its own `useEffect` checking for relevant updates
- List components check for `campaignData.entities === "reload"` to refetch
- Show components check for `campaignData.entity?.id === currentId` to update

This leads to:
- Duplicated update logic across components
- Difficult to maintain consistency
- No central place to debug or modify update behavior

## Proposed Solutions

### Option 1: Entity Update Callbacks
**Concept**: AppContext maintains a registry of callbacks that components can subscribe to for specific entity types.

```typescript
// In AppContext
const entityUpdateCallbacks = useRef<Map<string, Set<(data: any) => void>>>(new Map())

const subscribeToEntity = useCallback((entityType: string, callback: (data: any) => void) => {
  if (!entityUpdateCallbacks.current.has(entityType)) {
    entityUpdateCallbacks.current.set(entityType, new Set())
  }
  entityUpdateCallbacks.current.get(entityType)!.add(callback)
  
  return () => {
    entityUpdateCallbacks.current.get(entityType)?.delete(callback)
  }
}, [])

// Components usage
useEffect(() => {
  const unsubscribe = subscribeToEntity('character', (data) => {
    if (data === 'reload') {
      fetchCharacters()
    } else if (data.id === character.id) {
      setCharacter(data)
    }
  })
  return unsubscribe
}, [character.id])
```

**Pros:**
- Easy to integrate with existing components
- Minimal changes to component structure
- Flexible - components decide how to handle updates
- Clear subscription/unsubscription pattern

**Cons:**
- Still some duplication in components
- Components still need to understand update patterns
- Memory management of callbacks needs careful handling

### Option 2: Custom Hooks with Built-in Updates
**Concept**: Create specialized hooks that encapsulate both data fetching and real-time updates.

```typescript
// Custom hook
export function useEntityWithUpdates<T>(
  entityType: string,
  entityId: string | undefined,
  fetchEntity: () => Promise<T>
): { entity: T | null, loading: boolean, refetch: () => void } {
  const { campaignData } = useCampaign()
  const [entity, setEntity] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!campaignData) return
    
    const update = campaignData[entityType]
    if (update && update.id === entityId) {
      setEntity(update as T)
    }
  }, [campaignData, entityType, entityId])
  
  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchEntity()
      setEntity(data)
    } finally {
      setLoading(false)
    }
  }, [fetchEntity])
  
  return { entity, loading, refetch }
}

// Component usage
const { entity: character, loading, refetch } = useEntityWithUpdates(
  'character',
  characterId,
  () => client.getCharacter(characterId)
)
```

**Pros:**
- Very clean component code
- Completely abstracts update logic
- Reusable across all entity types
- Type-safe with generics

**Cons:**
- Requires rewriting component data fetching
- May not fit all use cases
- Less flexible for complex update scenarios

### Option 3: Entity State Manager (Cache)
**Concept**: AppContext maintains a cache of all entities and automatically updates them based on WebSocket messages.

```typescript
// In AppContext
const [entityCache, setEntityCache] = useState<Map<string, Map<string, any>>>(new Map())
const [staleEntities, setStaleEntities] = useState<Set<string>>(new Set())

useEffect(() => {
  if (!campaignData) return
  
  Object.entries(campaignData).forEach(([key, value]) => {
    if (value === "reload") {
      setStaleEntities(prev => new Set(prev).add(key))
    } else if (value && typeof value === "object" && value.id) {
      setEntityCache(prev => {
        const newCache = new Map(prev)
        if (!newCache.has(key)) {
          newCache.set(key, new Map())
        }
        newCache.get(key)!.set(value.id, value)
        return newCache
      })
    }
  })
}, [campaignData])

// Hook for components
export function useCachedEntity<T>(type: string, id: string): T | null {
  const { entityCache } = useApp()
  return entityCache.get(type)?.get(id) || null
}

export function useEntityList<T>(type: string): { entities: T[], isStale: boolean } {
  const { entityCache, staleEntities } = useApp()
  const entities = Array.from(entityCache.get(type)?.values() || [])
  const isStale = staleEntities.has(type)
  return { entities, isStale }
}
```

**Pros:**
- True single source of truth
- Automatic caching benefits
- Reduces API calls
- Consistent data across components

**Cons:**
- Complex state management
- Memory usage concerns with large datasets
- May conflict with server-side pagination
- Requires significant refactoring

### Option 4: Redux-Style Action Dispatch
**Concept**: Convert WebSocket updates into standardized actions that components can respond to.

```typescript
// Action types
type EntityAction = 
  | { type: 'RELOAD_CHARACTERS' }
  | { type: 'UPDATE_CHARACTER', payload: Character }
  | { type: 'RELOAD_FIGHTS' }
  | { type: 'UPDATE_FIGHT', payload: Fight }
  // ... etc

// In AppContext
const [entityState, dispatch] = useReducer(entityReducer, initialState)

useEffect(() => {
  if (!campaignData) return
  
  Object.entries(campaignData).forEach(([key, value]) => {
    if (value === "reload") {
      dispatch({ type: `RELOAD_${key.toUpperCase()}` as any })
    } else if (value && typeof value === "object") {
      dispatch({ 
        type: `UPDATE_${key.toUpperCase().slice(0, -1)}` as any,
        payload: value 
      })
    }
  })
}, [campaignData])

// Components subscribe to specific state slices
const characters = useSelector(state => state.characters)
const shouldReload = useSelector(state => state.reloadFlags.characters)
```

**Pros:**
- Predictable state updates
- Easy to debug with Redux DevTools
- Centralized business logic
- Familiar pattern for Redux users

**Cons:**
- Boilerplate code for actions/reducers
- May be overkill for this use case
- Learning curve if team isn't familiar with Redux patterns
- Type safety can be challenging

## Recommendation

**For immediate implementation:** Option 1 (Entity Update Callbacks) offers the best balance of:
- Ease of implementation
- Minimal disruption to existing code
- Flexibility for different component needs
- Clear mental model

**For long-term consideration:** Option 3 (Entity State Manager) could provide significant benefits if:
- The app grows to need client-side caching
- API call reduction becomes important
- Consistent cross-component state is critical

The callback approach (Option 1) can also serve as a stepping stone - the subscription pattern can later be adapted to work with a cache system if needed.