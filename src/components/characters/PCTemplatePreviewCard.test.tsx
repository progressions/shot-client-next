import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import PCTemplatePreviewCard from "./PCTemplatePreviewCard"
import { Character } from "@/types"

// Mock the CS service
jest.mock("@/services", () => ({
  CS: {
    mainAttack: jest.fn((char) => "Martial Arts"),
    mainAttackValue: jest.fn((char) => 15),
    fortune: jest.fn((char) => 6),
    fortuneType: jest.fn((char) => "Fortune"),
    archetype: jest.fn((char) => "Archer"),
    background: jest.fn((char) => "<p>A skilled archer from ancient times.</p>"),
  }
}))

// Mock RichTextRenderer
jest.mock("@/components/editor", () => ({
  RichTextRenderer: ({ html }: { html: string }) => <div dangerouslySetInnerHTML={{ __html: html }} />
}))

describe("PCTemplatePreviewCard", () => {
  const mockTemplate: Character = {
    id: "1",
    name: "Master Archer",
    image_url: "https://example.com/archer.jpg",
    action_values: {
      "Martial Arts": 15,
      Defense: 14,
      Toughness: 7,
      Speed: 8,
      Fortune: 6,
      FortuneType: "Fortune"
    },
    skills: {
      "Archery": 3,
      "Stealth": 2,
      "Tracking": 1
    },
    schticks: [
      { id: "s1", name: "Both Guns Blazing" },
      { id: "s2", name: "Eagle Eye" }
    ],
    weapons: [
      { 
        id: "w1", 
        name: "Longbow",
        damage: 10,
        concealment: 0,
        reload: 0
      },
      {
        id: "w2",
        name: "Dagger",
        damage: 7,
        concealment: 3,
        reload: 0
      }
    ]
  } as Character

  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("displays character name and archetype", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText("Master Archer")).toBeInTheDocument()
    expect(screen.getByText("Archer")).toBeInTheDocument()
  })

  it("shows action values", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText("Martial Arts")).toBeInTheDocument()
    expect(screen.getByText("15")).toBeInTheDocument()
    expect(screen.getByText("Defense")).toBeInTheDocument()
    expect(screen.getByText("14")).toBeInTheDocument()
    expect(screen.getByText("Toughness")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByText("Speed")).toBeInTheDocument()
    expect(screen.getByText("8")).toBeInTheDocument()
  })

  it("displays skills as chips", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText("Archery: 3")).toBeInTheDocument()
    expect(screen.getByText("Stealth: 2")).toBeInTheDocument()
    expect(screen.getByText("Tracking: 1")).toBeInTheDocument()
  })

  it("displays schticks as prominent chips", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText("Both Guns Blazing")).toBeInTheDocument()
    expect(screen.getByText("Eagle Eye")).toBeInTheDocument()
  })

  it("displays weapons with stats", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText(/Longbow.*10\/0\/0/)).toBeInTheDocument()
    expect(screen.getByText(/Dagger.*7\/3\/0/)).toBeInTheDocument()
  })

  it("calls onSelect when clicked", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole("button")
    fireEvent.click(card)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockTemplate)
  })

  it("shows loading state when isLoading is true", () => {
    const { container } = render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} isLoading={true} />)
    
    const card = container.querySelector(".MuiCard-root")
    expect(card).toHaveStyle({ opacity: "0.5", pointerEvents: "none" })
  })

  it("handles templates without skills gracefully", () => {
    const templateWithoutSkills = { ...mockTemplate, skills: undefined }
    render(<PCTemplatePreviewCard template={templateWithoutSkills} onSelect={mockOnSelect} />)
    
    expect(screen.queryByText("Skills")).not.toBeInTheDocument()
  })

  it("handles templates without schticks gracefully", () => {
    const templateWithoutSchticks = { ...mockTemplate, schticks: [] }
    render(<PCTemplatePreviewCard template={templateWithoutSchticks} onSelect={mockOnSelect} />)
    
    expect(screen.queryByText("Schticks (Powers & Abilities)")).not.toBeInTheDocument()
  })

  it("handles templates without weapons gracefully", () => {
    const templateWithoutWeapons = { ...mockTemplate, weapons: [] }
    render(<PCTemplatePreviewCard template={templateWithoutWeapons} onSelect={mockOnSelect} />)
    
    expect(screen.queryByText("Weapons")).not.toBeInTheDocument()
  })

  it("displays background description", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    expect(screen.getByText(/A skilled archer from ancient times/)).toBeInTheDocument()
  })

  it("displays character image when available", () => {
    render(<PCTemplatePreviewCard template={mockTemplate} onSelect={mockOnSelect} />)
    
    const image = screen.getByAltText("Master Archer")
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute("src", "https://example.com/archer.jpg")
  })

  it("displays avatar with initials when no image available", () => {
    const templateWithoutImage = { ...mockTemplate, image_url: undefined }
    render(<PCTemplatePreviewCard template={templateWithoutImage} onSelect={mockOnSelect} />)
    
    // Should show avatar with initials "MA" for Master Archer
    expect(screen.getByText("MA")).toBeInTheDocument()
  })
})