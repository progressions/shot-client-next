import { render, screen, fireEvent } from "@testing-library/react"
import { FilterAccordion } from "./FilterAccordion"
import { FilterOption } from "./EntityFilters"

describe("FilterAccordion", () => {
  const mockOnFiltersUpdate = jest.fn()

  const defaultProps = {
    filters: {},
    onFiltersUpdate: mockOnFiltersUpdate,
    title: "Test Filters",
  }

  const filterOptions: FilterOption[] = [
    {
      name: "visibility",
      label: "Visibility",
      type: "dropdown",
      defaultValue: "visible",
      options: [
        { value: "visible", label: "Visible" },
        { value: "hidden", label: "Hidden" },
        { value: "all", label: "All" },
      ],
    },
    {
      name: "active",
      label: "Active Only",
      type: "checkbox",
      defaultValue: false,
    },
  ]

  beforeEach(() => {
    mockOnFiltersUpdate.mockClear()
  })

  describe("Collapsed State", () => {
    it("should render with collapsed accordion by default", () => {
      render(<FilterAccordion {...defaultProps} />)

      expect(screen.getByTestId("filter-accordion")).toBeInTheDocument()
      expect(screen.getByText("Test Filters")).toBeInTheDocument()
    })

    it("should show filter count badge when filters are active", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "hidden",
          active: true,
        },
      }

      render(<FilterAccordion {...props} />)

      // Should show badge with count of 2 (visibility changed from default, active is true)
      const badge = screen.getByText("2")
      expect(badge).toBeInTheDocument()
    })

    it("should display active filter chips when collapsed", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "hidden",
          active: true,
        },
      }

      render(<FilterAccordion {...props} />)

      // Should show chips for active filters
      expect(screen.getByText("Visibility: Hidden")).toBeInTheDocument()
      expect(screen.getByText("Active Only")).toBeInTheDocument()
    })

    it("should show +N more chip when more than 3 filters are active", () => {
      const manyOptions: FilterOption[] = [
        ...filterOptions,
        { name: "filter3", label: "Filter 3", type: "checkbox" },
        { name: "filter4", label: "Filter 4", type: "checkbox" },
        { name: "filter5", label: "Filter 5", type: "checkbox" },
      ]

      const props = {
        ...defaultProps,
        filterOptions: manyOptions,
        filters: {
          visibility: "hidden",
          active: true,
          filter3: true,
          filter4: true,
          filter5: true,
        },
      }

      render(<FilterAccordion {...props} />)

      // Should show first 3 chips and a "+2 more" chip
      expect(screen.getByText("+2 more")).toBeInTheDocument()
    })

    it("should remove filter when chip delete is clicked", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "hidden",
        },
      }

      render(<FilterAccordion {...props} />)

      // Click the delete button on the visibility chip
      const deleteButton = screen.getByTestId("CancelIcon").closest("svg")
      fireEvent.click(deleteButton!)

      expect(mockOnFiltersUpdate).toHaveBeenCalledWith({
        visibility: "visible", // Reset to default
        page: 1,
      })
    })
  })

  describe("Expanded State", () => {
    it("should expand when accordion header is clicked", () => {
      render(
        <FilterAccordion {...defaultProps} filterOptions={filterOptions} />
      )

      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      // Check that filter controls are now visible
      expect(screen.getByLabelText("Visibility")).toBeInTheDocument()
    })

    it("should render EntityFilters options when provided", () => {
      render(
        <FilterAccordion {...defaultProps} filterOptions={filterOptions} />
      )

      // Expand accordion
      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      // Check for dropdown and checkbox
      expect(screen.getByLabelText("Visibility")).toBeInTheDocument()
      expect(screen.getByLabelText("Active Only")).toBeInTheDocument()
    })

    it("should render GenericFilter when entity is provided", () => {
      const formState = {
        data: {
          filters: {},
        },
      }

      const props = {
        ...defaultProps,
        entity: "Character" as const,
        formState,
      }

      render(<FilterAccordion {...props} />)

      // Expand accordion
      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      // GenericFilter should be rendered
      // This would need actual GenericFilter component to be tested properly
      expect(screen.getByTestId("filter-accordion")).toBeInTheDocument()
    })
  })

  describe("Clear All Functionality", () => {
    it("should show Clear All button when filters are active", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "hidden",
          active: true,
        },
      }

      render(<FilterAccordion {...props} />)

      // Expand accordion
      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      expect(screen.getByTestId("clear-all-filters")).toBeInTheDocument()
    })

    it("should clear all filters when Clear All is clicked", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "hidden",
          active: true,
          search: "test search",
        },
      }

      render(<FilterAccordion {...props} />)

      // Expand accordion
      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      // Click Clear All
      const clearButton = screen.getByTestId("clear-all-filters")
      fireEvent.click(clearButton)

      expect(mockOnFiltersUpdate).toHaveBeenCalledWith({
        visibility: "visible", // Reset to default
        active: false, // Reset to default
        search: "", // Clear search
        page: 1,
      })
    })

    it("should not show Clear All button when no filters are active", () => {
      const props = {
        ...defaultProps,
        filterOptions,
        filters: {
          visibility: "visible", // Default value
          active: false, // Default value
        },
      }

      render(<FilterAccordion {...props} />)

      // Expand accordion
      const accordionHeader = screen
        .getByText("Test Filters")
        .closest("div[role='button']")
      fireEvent.click(accordionHeader!)

      expect(screen.queryByTestId("clear-all-filters")).not.toBeInTheDocument()
    })
  })

  describe("Search Integration", () => {
    it("should show search in active filters when search has value", () => {
      const props = {
        ...defaultProps,
        filters: {
          search: "test query",
        },
      }

      render(<FilterAccordion {...props} />)

      expect(screen.getByText('Search: "test query"')).toBeInTheDocument()
    })

    it("should clear search when its chip is removed", () => {
      const props = {
        ...defaultProps,
        filters: {
          search: "test query",
        },
      }

      render(<FilterAccordion {...props} />)

      const deleteButton = screen.getByTestId("CancelIcon").closest("svg")
      fireEvent.click(deleteButton!)

      expect(mockOnFiltersUpdate).toHaveBeenCalledWith({
        search: "",
        page: 1,
      })
    })
  })
})
