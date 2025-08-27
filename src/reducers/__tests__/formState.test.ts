import {
  FormActions,
  FormStateType,
  formReducer,
  initializeFormState,
  useForm,
} from "../formState"
import { renderHook, act } from "@testing-library/react"

interface TestData {
  id: string
  name: string
  email: string
  active: boolean
  count: number
}

const mockInitialData: TestData = {
  id: "test-1",
  name: "Test Name",
  email: "test@example.com",
  active: true,
  count: 0,
}

describe("initializeFormState", () => {
  it("creates initial form state with provided data", () => {
    const result = initializeFormState(mockInitialData)

    expect(result).toEqual({
      edited: false,
      loading: true,
      saving: false,
      disabled: true,
      open: false,
      errors: {},
      status: null,
      success: null,
      data: mockInitialData,
    })
  })

  it("creates initial form state with empty data when null provided", () => {
    const result = initializeFormState<TestData>(null)

    expect(result).toEqual({
      edited: false,
      loading: true,
      saving: false,
      disabled: true,
      open: false,
      errors: {},
      status: null,
      success: null,
      data: {},
    })
  })
})

describe("formReducer", () => {
  let initialState: FormStateType<TestData>

  beforeEach(() => {
    initialState = initializeFormState(mockInitialData)
  })

  it("maintains state immutability", () => {
    const action = {
      type: FormActions.EDIT,
      name: "name",
      value: "New Name",
    }

    const newState = formReducer(initialState, action)

    expect(newState).not.toBe(initialState)
    expect(newState.data).not.toBe(initialState.data)
    expect(initialState.data.name).toBe("Test Name")
    expect(newState.data.name).toBe("New Name")
  })

  describe("EDIT action", () => {
    it("updates data field and sets edited flag when name and value provided", () => {
      const action = {
        type: FormActions.EDIT,
        name: "name",
        value: "Updated Name",
      }

      const newState = formReducer(initialState, action)

      expect(newState.edited).toBe(true)
      expect(newState.loading).toBe(false)
      expect(newState.data.name).toBe("Updated Name")
      expect(newState.data.email).toBe(mockInitialData.email) // unchanged
    })

    it("handles boolean values correctly", () => {
      const action = {
        type: FormActions.EDIT,
        name: "active",
        value: false,
      }

      const newState = formReducer(initialState, action)

      expect(newState.data.active).toBe(false)
      expect(newState.edited).toBe(true)
    })

    it("handles numeric values correctly", () => {
      const action = {
        type: FormActions.EDIT,
        name: "count",
        value: 42,
      }

      const newState = formReducer(initialState, action)

      expect(newState.data.count).toBe(42)
      expect(newState.edited).toBe(true)
    })

    it("only sets edited flag when no name or value provided", () => {
      const action = {
        type: FormActions.EDIT,
      }

      const newState = formReducer(initialState, action)

      expect(newState.edited).toBe(true)
      expect(newState.data).toEqual(initialState.data)
    })
  })

  describe("UPDATE action", () => {
    it("updates data and sets form to editable state", () => {
      const action = {
        type: FormActions.UPDATE,
        name: "email",
        value: "new@example.com",
      }

      const newState = formReducer(initialState, action)

      expect(newState.edited).toBe(true)
      expect(newState.disabled).toBe(false)
      expect(newState.saving).toBe(false)
      expect(newState.data.email).toBe("new@example.com")
    })

    it("handles object values for EncounterContext use case", () => {
      interface EncounterData {
        encounter: unknown
        weapons: { [id: string]: unknown }
        schticks: { [id: string]: unknown }
      }

      const initialEncounterData = {
        encounter: null,
        weapons: {},
        schticks: {},
      }

      const initialState =
        initializeFormState<EncounterData>(initialEncounterData)

      const weaponsMap = {
        "weapon-1": { id: "weapon-1", name: "Test Weapon" },
      }

      const schticksMap = {
        "schtick-1": { id: "schtick-1", name: "Test Schtick" },
      }

      // Update weapons
      let newState = formReducer(initialState, {
        type: FormActions.UPDATE,
        name: "weapons",
        value: weaponsMap,
      })

      expect(Object.keys(newState.data.weapons)).toHaveLength(1)
      expect(newState.data.weapons["weapon-1"]).toEqual({
        id: "weapon-1",
        name: "Test Weapon",
      })

      // Update schticks
      newState = formReducer(newState, {
        type: FormActions.UPDATE,
        name: "schticks",
        value: schticksMap,
      })

      expect(Object.keys(newState.data.weapons)).toHaveLength(1)
      expect(Object.keys(newState.data.schticks)).toHaveLength(1)
      expect(newState.data.schticks["schtick-1"]).toEqual({
        id: "schtick-1",
        name: "Test Schtick",
      })
    })
  })

  describe("OPEN action", () => {
    it("sets open state to true", () => {
      const action = {
        type: FormActions.OPEN,
        payload: true,
      }

      const newState = formReducer(initialState, action)

      expect(newState.open).toBe(true)
    })

    it("sets open state to false", () => {
      const stateWithOpen = { ...initialState, open: true }
      const action = {
        type: FormActions.OPEN,
        payload: false,
      }

      const newState = formReducer(stateWithOpen, action)

      expect(newState.open).toBe(false)
    })
  })

  describe("DISABLE action", () => {
    it("sets disabled state", () => {
      const stateWithEnabled = { ...initialState, disabled: false }
      const action = {
        type: FormActions.DISABLE,
        payload: true,
      }

      const newState = formReducer(stateWithEnabled, action)

      expect(newState.disabled).toBe(true)
    })
  })

  describe("LOADING action", () => {
    it("sets loading state to true", () => {
      const stateWithoutLoading = { ...initialState, loading: false }
      const action = {
        type: FormActions.LOADING,
        payload: true,
      }

      const newState = formReducer(stateWithoutLoading, action)

      expect(newState.loading).toBe(true)
    })

    it("sets loading state to false", () => {
      const action = {
        type: FormActions.LOADING,
        payload: false,
      }

      const newState = formReducer(initialState, action)

      expect(newState.loading).toBe(false)
    })
  })

  describe("ERROR action", () => {
    it("sets field-specific error and disables form", () => {
      const action = {
        type: FormActions.ERROR,
        name: "email",
        value: "Invalid email format",
      }

      const newState = formReducer(initialState, action)

      expect(newState.disabled).toBe(true)
      expect(newState.saving).toBe(false)
      expect(newState.loading).toBe(false)
      expect(newState.errors.email).toBe("Invalid email format")
      expect(newState.success).toBeNull()
    })

    it("clears field error when value is null", () => {
      const stateWithError = {
        ...initialState,
        errors: { email: "Some error" },
      }
      const action = {
        type: FormActions.ERROR,
        name: "email",
        value: null,
      }

      const newState = formReducer(stateWithError, action)

      expect(newState.errors.email).toBeNull()
    })

    it("preserves other field errors", () => {
      const stateWithErrors = {
        ...initialState,
        errors: { name: "Name required", email: "Invalid email" },
      }
      const action = {
        type: FormActions.ERROR,
        name: "email",
        value: "New email error",
      }

      const newState = formReducer(stateWithErrors, action)

      expect(newState.errors.name).toBe("Name required")
      expect(newState.errors.email).toBe("New email error")
    })
  })

  describe("ERRORS action", () => {
    it("sets multiple errors and disables form", () => {
      const errors = { name: "Required", email: "Invalid" }
      const action = {
        type: FormActions.ERRORS,
        payload: errors,
      }

      const newState = formReducer(initialState, action)

      expect(newState.disabled).toBe(true)
      expect(newState.saving).toBe(false)
      expect(newState.loading).toBe(false)
      expect(newState.errors).toEqual(errors)
      expect(newState.success).toBeNull()
    })

    it("clears all errors when payload is null", () => {
      const stateWithErrors = {
        ...initialState,
        errors: { name: "Error", email: "Error" },
      }
      const action = {
        type: FormActions.ERRORS,
        payload: null,
      }

      const newState = formReducer(stateWithErrors, action)

      expect(newState.errors).toEqual({})
    })
  })

  describe("STATUS action", () => {
    it("sets status with severity and message", () => {
      const action = {
        type: FormActions.STATUS,
        severity: "warning",
        message: "This is a warning",
      }

      const newState = formReducer(initialState, action)

      expect(newState.status).toEqual({
        severity: "warning",
        message: "This is a warning",
      })
    })
  })

  describe("SUCCESS action", () => {
    it("sets success state and clears errors", () => {
      const stateWithErrors = {
        ...initialState,
        errors: { name: "Error" },
        disabled: true,
        saving: true,
        loading: true,
      }
      const action = {
        type: FormActions.SUCCESS,
        payload: "Successfully saved!",
      }

      const newState = formReducer(stateWithErrors, action)

      expect(newState.disabled).toBe(false)
      expect(newState.saving).toBe(false)
      expect(newState.loading).toBe(false)
      expect(newState.errors).toEqual({})
      expect(newState.success).toBe("Successfully saved!")
      expect(newState.status).toEqual({
        severity: "success",
        message: "Successfully saved!",
      })
    })

    it("uses default success message when payload is null", () => {
      const action = {
        type: FormActions.SUCCESS,
        payload: null,
      }

      const newState = formReducer(initialState, action)

      expect(newState.success).toBeNull()
      expect(newState.status).toEqual({
        severity: "success",
        message: "Operation successful",
      })
    })
  })

  describe("SUBMIT action", () => {
    it("prepares form for submission", () => {
      const stateWithErrorsAndSuccess = {
        ...initialState,
        errors: { name: "Error" },
        success: "Previous success",
        edited: true,
        saving: false,
        status: { severity: "error", message: "Error" },
      }
      const action = { type: FormActions.SUBMIT }

      const newState = formReducer(stateWithErrorsAndSuccess, action)

      expect(newState.errors).toEqual({})
      expect(newState.success).toBeNull()
      expect(newState.edited).toBe(false)
      expect(newState.saving).toBe(true)
      expect(newState.status).toBeNull()
    })
  })

  describe("RESET action", () => {
    it("replaces state with provided payload", () => {
      const newFormState = initializeFormState({
        id: "new-id",
        name: "New Name",
        email: "new@example.com",
        active: false,
        count: 100,
      })
      const action = {
        type: FormActions.RESET,
        payload: newFormState,
      }

      const newState = formReducer(initialState, action)

      expect(newState).toEqual(newFormState)
      expect(newState).not.toBe(initialState)
    })
  })

  describe("unknown action", () => {
    it("returns current state unchanged", () => {
      const unknownAction = { type: "UNKNOWN_ACTION" } as unknown

      const newState = formReducer(initialState, unknownAction)

      expect(newState).toBe(initialState)
    })
  })
})

describe("useForm hook", () => {
  it("initializes with provided data", () => {
    const { result } = renderHook(() => useForm(mockInitialData))

    expect(result.current.formState.data).toEqual(mockInitialData)
    expect(result.current.formState.loading).toBe(true)
    expect(result.current.formState.disabled).toBe(true)
    expect(result.current.formState.edited).toBe(false)
  })

  it("dispatches EDIT action correctly", () => {
    const { result } = renderHook(() => useForm(mockInitialData))

    act(() => {
      result.current.dispatchForm({
        type: FormActions.EDIT,
        name: "name",
        value: "Updated Name",
      })
    })

    expect(result.current.formState.data.name).toBe("Updated Name")
    expect(result.current.formState.edited).toBe(true)
    expect(result.current.formState.loading).toBe(false)
  })

  it("maintains memoized data stability", () => {
    const { result } = renderHook(() => useForm(mockInitialData))
    const firstData = result.current.formState.data

    // Re-render without state change
    act(() => {
      // No dispatch, just trigger re-render
    })

    expect(result.current.formState.data).toBe(firstData)
  })

  it("provides access to initial form state", () => {
    const { result } = renderHook(() => useForm(mockInitialData))

    expect(result.current.initialFormState).toEqual({
      edited: false,
      loading: true,
      saving: false,
      disabled: true,
      open: false,
      errors: {},
      status: null,
      success: null,
      data: mockInitialData,
    })
  })
})
