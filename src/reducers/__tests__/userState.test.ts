import {
  UserActions,
  UserStateType,
  UserStateAction,
  userReducer,
  initialUserState,
} from "../userState"
import { defaultUser, type User } from "@/types"

describe("userState reducer", () => {
  const mockUser: User = {
    ...defaultUser,
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    admin: false,
    gamemaster: true,
  }

  describe("initial state", () => {
    it("has correct initial state structure", () => {
      expect(initialUserState).toEqual({
        edited: false,
        saving: false,
        user: defaultUser,
      })
    })

    it("initial user has expected default properties", () => {
      expect(initialUserState.user).toEqual({
        entity_class: "User",
        id: "",
        email: "",
        name: "",
        image_url: "",
        created_at: "",
        updated_at: "",
        admin: false,
        gamemaster: false,
      })
    })
  })

  describe("UserActions.EDITED", () => {
    it("sets edited flag to true", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: false,
      }

      const action: UserStateAction = {
        type: UserActions.EDITED,
      }

      const newState = userReducer(initialState, action)

      expect(newState.edited).toBe(true)
      expect(newState.saving).toBe(false)
      expect(newState.user).toBe(initialState.user) // Same reference
    })

    it("keeps edited flag true if already true", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: true,
      }

      const action: UserStateAction = {
        type: UserActions.EDITED,
      }

      const newState = userReducer(initialState, action)

      expect(newState.edited).toBe(true)
    })

    it("maintains state immutability", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: false,
      }

      const action: UserStateAction = {
        type: UserActions.EDITED,
      }

      const newState = userReducer(initialState, action)

      expect(newState).not.toBe(initialState)
      expect(newState.user).toBe(initialState.user) // User object not changed
    })
  })

  describe("UserActions.UPDATE", () => {
    it("updates string field and sets edited flag", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: false,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "name",
        value: "Updated Name",
      }

      const newState = userReducer(initialState, action)

      expect(newState.edited).toBe(true)
      expect(newState.user.name).toBe("Updated Name")
      expect(newState.user.id).toBe("user-123") // Other fields unchanged
      expect(newState.saving).toBe(false)
    })

    it("updates email field", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "email",
        value: "newemail@example.com",
      }

      const newState = userReducer(initialState, action)

      expect(newState.user.email).toBe("newemail@example.com")
      expect(newState.edited).toBe(true)
    })

    it("updates boolean field (admin)", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: { ...mockUser, admin: false },
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "admin",
        value: true,
      }

      const newState = userReducer(initialState, action)

      expect(newState.user.admin).toBe(true)
      expect(newState.edited).toBe(true)
    })

    it("updates boolean field (gamemaster)", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: { ...mockUser, gamemaster: true },
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "gamemaster",
        value: false,
      }

      const newState = userReducer(initialState, action)

      expect(newState.user.gamemaster).toBe(false)
      expect(newState.edited).toBe(true)
    })

    it("handles numeric value updates", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "some_numeric_field" as unknown, // Type assertion for test
        value: 42,
      }

      const newState = userReducer(initialState, action)

      expect((newState.user as unknown).some_numeric_field).toBe(42)
      expect(newState.edited).toBe(true)
    })

    it("maintains state immutability", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "name",
        value: "New Name",
      }

      const newState = userReducer(initialState, action)

      expect(newState).not.toBe(initialState)
      expect(newState.user).not.toBe(initialState.user)
      expect(initialState.user.name).toBe("Test User") // Original unchanged
      expect(newState.user.name).toBe("New Name")
    })

    it("preserves other user fields during update", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "name",
        value: "Updated Name",
      }

      const newState = userReducer(initialState, action)

      expect(newState.user.id).toBe(mockUser.id)
      expect(newState.user.email).toBe(mockUser.email)
      expect(newState.user.admin).toBe(mockUser.admin)
      expect(newState.user.gamemaster).toBe(mockUser.gamemaster)
      expect(newState.user.image_url).toBe(mockUser.image_url)
      expect(newState.user.created_at).toBe(mockUser.created_at)
      expect(newState.user.updated_at).toBe(mockUser.updated_at)
    })
  })

  describe("UserActions.SUBMIT", () => {
    it("sets saving to true and edited to false", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: true,
        saving: false,
      }

      const action: UserStateAction = {
        type: UserActions.SUBMIT,
      }

      const newState = userReducer(initialState, action)

      expect(newState.saving).toBe(true)
      expect(newState.edited).toBe(false)
      expect(newState.user).toBe(initialState.user) // User unchanged
    })

    it("maintains user data during submit", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
        edited: true,
      }

      const action: UserStateAction = {
        type: UserActions.SUBMIT,
      }

      const newState = userReducer(initialState, action)

      expect(newState.user).toBe(mockUser)
      expect(newState.saving).toBe(true)
      expect(newState.edited).toBe(false)
    })
  })

  describe("UserActions.USER", () => {
    it("updates user data and clears saving/edited flags", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        edited: true,
        saving: true,
        user: defaultUser,
      }

      const action: UserStateAction = {
        type: UserActions.USER,
        payload: mockUser,
      }

      const newState = userReducer(initialState, action)

      expect(newState.user).toBe(mockUser)
      expect(newState.saving).toBe(false)
      expect(newState.edited).toBe(false)
    })

    it("replaces entire user object", () => {
      const oldUser: User = {
        ...defaultUser,
        id: "old-123",
        name: "Old Name",
        email: "old@example.com",
      }

      const initialState: UserStateType = {
        ...initialUserState,
        user: oldUser,
      }

      const newUser: User = {
        ...defaultUser,
        id: "new-456",
        name: "New Name",
        email: "new@example.com",
        admin: true,
      }

      const action: UserStateAction = {
        type: UserActions.USER,
        payload: newUser,
      }

      const newState = userReducer(initialState, action)

      expect(newState.user).toBe(newUser)
      expect(newState.user.id).toBe("new-456")
      expect(newState.user.name).toBe("New Name")
      expect(newState.user.email).toBe("new@example.com")
      expect(newState.user.admin).toBe(true)
    })
  })

  describe("UserActions.RESET", () => {
    it("clears saving flag", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        saving: true,
        edited: true,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.RESET,
      }

      const newState = userReducer(initialState, action)

      expect(newState.saving).toBe(false)
      expect(newState.edited).toBe(true) // Edited flag preserved
      expect(newState.user).toBe(mockUser) // User preserved
    })

    it("preserves edited state and user data", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        saving: true,
        edited: true,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.RESET,
      }

      const newState = userReducer(initialState, action)

      expect(newState.saving).toBe(false)
      expect(newState.edited).toBe(true)
      expect(newState.user).toBe(initialState.user)
    })
  })

  describe("default case", () => {
    it("returns initial state for unknown action types", () => {
      const customState: UserStateType = {
        edited: true,
        saving: true,
        user: mockUser,
      }

      const unknownAction = { type: "UNKNOWN_ACTION" } as unknown

      const newState = userReducer(customState, unknownAction)

      expect(newState).toBe(initialUserState)
      expect(newState.edited).toBe(false)
      expect(newState.saving).toBe(false)
      expect(newState.user).toBe(defaultUser)
    })

    it("does not return the original state for unknown actions", () => {
      const customState: UserStateType = {
        edited: true,
        saving: true,
        user: mockUser,
      }

      const unknownAction = { type: "UNKNOWN_ACTION" } as unknown

      const newState = userReducer(customState, unknownAction)

      expect(newState).not.toBe(customState)
      expect(newState).toBe(initialUserState)
    })
  })

  describe("state immutability", () => {
    it("always returns new state objects", () => {
      const actions: UserStateAction[] = [
        { type: UserActions.EDITED },
        { type: UserActions.UPDATE, name: "name", value: "Test" },
        { type: UserActions.SUBMIT },
        { type: UserActions.USER, payload: mockUser },
        { type: UserActions.RESET },
      ]

      actions.forEach(action => {
        const initialState: UserStateType = {
          edited: false,
          saving: false,
          user: defaultUser,
        }

        const newState = userReducer(initialState, action)
        expect(newState).not.toBe(initialState)
      })
    })

    it("creates new user object when updating fields", () => {
      const initialState: UserStateType = {
        ...initialUserState,
        user: mockUser,
      }

      const action: UserStateAction = {
        type: UserActions.UPDATE,
        name: "name",
        value: "New Name",
      }

      const newState = userReducer(initialState, action)

      expect(newState.user).not.toBe(initialState.user)
      expect(newState.user).toEqual({
        ...mockUser,
        name: "New Name",
      })
    })
  })

  describe("complex workflows", () => {
    it("handles typical user editing workflow", () => {
      // Start with initial state
      let state = initialUserState

      // User loads
      state = userReducer(state, {
        type: UserActions.USER,
        payload: mockUser,
      })
      expect(state.user).toBe(mockUser)
      expect(state.edited).toBe(false)
      expect(state.saving).toBe(false)

      // User starts editing
      state = userReducer(state, {
        type: UserActions.UPDATE,
        name: "name",
        value: "Updated Name",
      })
      expect(state.edited).toBe(true)
      expect(state.user.name).toBe("Updated Name")
      expect(state.saving).toBe(false)

      // User submits
      state = userReducer(state, {
        type: UserActions.SUBMIT,
      })
      expect(state.edited).toBe(false)
      expect(state.saving).toBe(true)

      // Save completes successfully
      const updatedUser = { ...mockUser, name: "Updated Name" }
      state = userReducer(state, {
        type: UserActions.USER,
        payload: updatedUser,
      })
      expect(state.user).toBe(updatedUser)
      expect(state.edited).toBe(false)
      expect(state.saving).toBe(false)
    })

    it("handles save failure with reset", () => {
      let state: UserStateType = {
        edited: false,
        saving: true,
        user: mockUser,
      }

      // Save fails, reset the saving state
      state = userReducer(state, {
        type: UserActions.RESET,
      })

      expect(state.saving).toBe(false)
      expect(state.user).toBe(mockUser)
      expect(state.edited).toBe(false)
    })
  })
})
