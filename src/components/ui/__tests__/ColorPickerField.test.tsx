import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ColorPickerField } from "../ColorPickerField"

describe("ColorPickerField", () => {
  const defaultProps = {
    value: "#ff0000",
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const getColorSwatch = () =>
    screen.getByRole("button", { name: /open color picker/i })

  describe("rendering", () => {
    it("renders the color swatch and input field", () => {
      render(<ColorPickerField {...defaultProps} />)

      expect(getColorSwatch()).toBeInTheDocument()
      expect(screen.getByRole("textbox")).toBeInTheDocument()
    })

    it("displays the label", () => {
      render(<ColorPickerField {...defaultProps} label="Ring Color" />)

      expect(screen.getByLabelText("Ring Color")).toBeInTheDocument()
    })

    it("uses default label when not provided", () => {
      render(<ColorPickerField {...defaultProps} />)

      expect(screen.getByLabelText("Color")).toBeInTheDocument()
    })

    it("shows the current color value in the input", () => {
      render(<ColorPickerField {...defaultProps} value="#00ff00" />)

      expect(screen.getByRole("textbox")).toHaveValue("#00ff00")
    })

    it("shows placeholder when value is null", () => {
      render(<ColorPickerField {...defaultProps} value={null} />)

      expect(screen.getByPlaceholderText("#000000")).toBeInTheDocument()
    })
  })

  describe("color validation", () => {
    it("accepts valid 6-digit hex colors", () => {
      const onChange = jest.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "#abcdef" } })

      expect(onChange).toHaveBeenCalledWith("#abcdef")
    })

    it("accepts valid 3-digit hex colors", () => {
      const onChange = jest.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "#abc" } })

      expect(onChange).toHaveBeenCalledWith("#abc")
    })

    it("does not call onChange for invalid hex colors", () => {
      const onChange = jest.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "#xyz" } })

      expect(onChange).not.toHaveBeenCalled()
    })

    it("auto-prepends # when missing", () => {
      const onChange = jest.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "ff0000" } })

      expect(onChange).toHaveBeenCalledWith("#ff0000")
    })

    it("reverts to original value on blur when input is invalid", () => {
      render(<ColorPickerField {...defaultProps} value="#ff0000" />)

      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "#invalid" } })
      fireEvent.blur(input)

      expect(input).toHaveValue("#ff0000")
    })
  })

  describe("picker interactions", () => {
    it("opens color picker popover when swatch is clicked", async () => {
      render(<ColorPickerField {...defaultProps} />)

      fireEvent.click(getColorSwatch())

      await waitFor(() => {
        expect(document.querySelector(".react-colorful")).toBeInTheDocument()
      })
    })

    it("does not open picker when disabled", () => {
      render(<ColorPickerField {...defaultProps} disabled={true} />)

      fireEvent.click(getColorSwatch())

      expect(document.querySelector(".react-colorful")).not.toBeInTheDocument()
    })
  })

  describe("clear functionality", () => {
    const getClearButton = () =>
      screen.getByTestId("ClearIcon").closest("button")

    it("shows clear button when value is set", () => {
      render(<ColorPickerField {...defaultProps} value="#ff0000" />)

      expect(getClearButton()).toBeInTheDocument()
    })

    it("does not show clear button when value is null", () => {
      render(<ColorPickerField {...defaultProps} value={null} />)

      expect(screen.queryByTestId("ClearIcon")).not.toBeInTheDocument()
    })

    it("calls onChange with null when clear is clicked", () => {
      const onChange = jest.fn()
      render(
        <ColorPickerField
          {...defaultProps}
          value="#ff0000"
          onChange={onChange}
        />
      )

      const clearButton = getClearButton()
      fireEvent.click(clearButton!)

      expect(onChange).toHaveBeenCalledWith(null)
    })
  })

  describe("state synchronization", () => {
    it("updates input when value prop changes externally", () => {
      const { rerender } = render(
        <ColorPickerField {...defaultProps} value="#ff0000" />
      )

      expect(screen.getByRole("textbox")).toHaveValue("#ff0000")

      rerender(<ColorPickerField {...defaultProps} value="#00ff00" />)

      expect(screen.getByRole("textbox")).toHaveValue("#00ff00")
    })

    it("clears input when value prop becomes null", () => {
      const { rerender } = render(
        <ColorPickerField {...defaultProps} value="#ff0000" />
      )

      expect(screen.getByRole("textbox")).toHaveValue("#ff0000")

      rerender(<ColorPickerField {...defaultProps} value={null} />)

      expect(screen.getByRole("textbox")).toHaveValue("")
    })
  })

  describe("accessibility", () => {
    it("has proper aria-label on swatch when color is set", () => {
      render(<ColorPickerField {...defaultProps} value="#ff0000" />)

      expect(getColorSwatch()).toHaveAttribute(
        "aria-label",
        "Open color picker, current color: #ff0000"
      )
    })

    it("has proper aria-label on swatch when no color", () => {
      render(<ColorPickerField {...defaultProps} value={null} />)

      expect(getColorSwatch()).toHaveAttribute(
        "aria-label",
        "Open color picker"
      )
    })

    it("has aria-disabled when disabled", () => {
      render(<ColorPickerField {...defaultProps} disabled={true} />)

      expect(getColorSwatch()).toHaveAttribute("aria-disabled", "true")
    })

    it("is keyboard accessible - opens picker on Enter", async () => {
      render(<ColorPickerField {...defaultProps} />)

      fireEvent.keyDown(getColorSwatch(), { key: "Enter" })

      await waitFor(() => {
        expect(document.querySelector(".react-colorful")).toBeInTheDocument()
      })
    })

    it("is keyboard accessible - opens picker on Space", async () => {
      render(<ColorPickerField {...defaultProps} />)

      fireEvent.keyDown(getColorSwatch(), { key: " " })

      await waitFor(() => {
        expect(document.querySelector(".react-colorful")).toBeInTheDocument()
      })
    })

    it("has tabIndex 0 when enabled", () => {
      render(<ColorPickerField {...defaultProps} />)

      expect(getColorSwatch()).toHaveAttribute("tabIndex", "0")
    })

    it("has tabIndex -1 when disabled", () => {
      render(<ColorPickerField {...defaultProps} disabled={true} />)

      expect(getColorSwatch()).toHaveAttribute("tabIndex", "-1")
    })
  })

  describe("disabled state", () => {
    it("disables the input field", () => {
      render(<ColorPickerField {...defaultProps} disabled={true} />)

      expect(screen.getByRole("textbox")).toBeDisabled()
    })

    it("disables the clear button", () => {
      render(
        <ColorPickerField {...defaultProps} value="#ff0000" disabled={true} />
      )

      const clearButton = screen.getByTestId("ClearIcon").closest("button")
      expect(clearButton).toBeDisabled()
    })
  })
})
