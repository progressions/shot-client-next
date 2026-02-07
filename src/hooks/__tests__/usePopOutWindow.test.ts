import { renderHook, act } from "@testing-library/react"
import { usePopOutWindow } from "../usePopOutWindow"

// Mock window for the pop-out
function createMockWindow() {
  const listeners: Record<string, Array<() => void>> = {}
  return {
    closed: false,
    document: {
      title: "",
      body: {
        style: {} as CSSStyleDeclaration,
        appendChild: jest.fn(),
      },
      createElement: jest.fn(() => ({
        id: "",
      })),
    },
    close: jest.fn(),
    focus: jest.fn(),
    addEventListener: jest.fn((event: string, handler: () => void) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(handler)
    }),
    _listeners: listeners,
  } as unknown as Window
}

describe("usePopOutWindow", () => {
  let originalWindowOpen: typeof window.open

  beforeEach(() => {
    originalWindowOpen = window.open
    jest.useFakeTimers()
  })

  afterEach(() => {
    window.open = originalWindowOpen
    jest.useRealTimers()
  })

  it("starts with isPoppedOut false and containerEl null", () => {
    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    expect(result.current.isPoppedOut).toBe(false)
    expect(result.current.containerEl).toBeNull()
  })

  it("opens a new window on popOut and sets isPoppedOut to true", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      const win = result.current.popOut()
      expect(win).toBe(mockWin)
    })

    expect(window.open).toHaveBeenCalledWith(
      "",
      "Test Window",
      "width=900,height=700,toolbar=no,menubar=no,resizable=yes,scrollbars=yes"
    )
    expect(result.current.isPoppedOut).toBe(true)
    expect(result.current.containerEl).not.toBeNull()
  })

  it("returns null when popup is blocked", () => {
    window.open = jest.fn(() => null)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    let win: Window | null = null
    act(() => {
      win = result.current.popOut()
    })

    expect(win).toBeNull()
    expect(result.current.isPoppedOut).toBe(false)
    expect(result.current.containerEl).toBeNull()
  })

  it("focuses existing window instead of opening a new one", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      result.current.popOut()
    })

    // Call popOut again — should focus, not open a new window
    act(() => {
      const win = result.current.popOut()
      expect(win).toBe(mockWin)
    })

    expect(window.open).toHaveBeenCalledTimes(1)
    expect(mockWin.focus).toHaveBeenCalled()
  })

  it("closes window and resets state on popIn", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      result.current.popOut()
    })

    expect(result.current.isPoppedOut).toBe(true)

    act(() => {
      result.current.popIn()
    })

    expect(mockWin.close).toHaveBeenCalled()
    expect(result.current.isPoppedOut).toBe(false)
    expect(result.current.containerEl).toBeNull()
  })

  it("detects child window close via fallback polling", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      result.current.popOut()
    })

    expect(result.current.isPoppedOut).toBe(true)

    // Simulate the window being closed
    ;(mockWin as unknown as { closed: boolean }).closed = true

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.isPoppedOut).toBe(false)
    expect(result.current.containerEl).toBeNull()
  })

  it("cleans up on unmount", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result, unmount } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      result.current.popOut()
    })

    expect(result.current.isPoppedOut).toBe(true)

    unmount()

    expect(mockWin.close).toHaveBeenCalled()
  })

  it("sets document title and body styles on the new window", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Locations - Fight"))

    act(() => {
      result.current.popOut()
    })

    expect(mockWin.document.title).toBe("Locations - Fight")
    expect(mockWin.document.body.style.backgroundColor).toBe("#0a0a0a")
    expect(mockWin.document.body.style.color).toBe("#fafafa")
  })

  it("registers beforeunload and unload listeners on child window", () => {
    const mockWin = createMockWindow()
    window.open = jest.fn(() => mockWin)

    const { result } = renderHook(() => usePopOutWindow("Test Window"))

    act(() => {
      result.current.popOut()
    })

    expect(mockWin.addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    )
    expect(mockWin.addEventListener).toHaveBeenCalledWith(
      "unload",
      expect.any(Function)
    )
  })
})
