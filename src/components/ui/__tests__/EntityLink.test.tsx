import React from "react"
import { render, screen, fireEvent } from "@/test-utils"
import EntityLink from "../links/EntityLink"
import type { Entity } from "@/types"

// Mock dynamic imports for popup components
jest.mock("next/dynamic", () => () => {
  const MockPopup = () => <div data-testid="mock-popup">Mock Popup</div>
  return MockPopup
})

describe("EntityLink", () => {
  describe("popup-only entity types", () => {
    const popupOnlyTypes = ["Info", "ActionValue", "Type", "Archetype"]

    popupOnlyTypes.forEach(entityClass => {
      describe(`${entityClass} entity type`, () => {
        const entity: Entity = {
          id: "test-id",
          entity_class: entityClass,
          name: `Test ${entityClass}`,
        }

        it("does not have an href attribute", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("button")
          expect(link).not.toHaveAttribute("href")
        })

        it("has role='button' for accessibility", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("button")
          expect(link).toBeInTheDocument()
        })

        it("has tabIndex=0 for keyboard accessibility", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("button")
          expect(link).toHaveAttribute("tabindex", "0")
        })

        it("does not have target='_blank'", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("button")
          expect(link).not.toHaveAttribute("target")
        })

        it("prevents default navigation on click", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("button")
          const clickEvent = new MouseEvent("click", { bubbles: true })
          const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault")

          fireEvent(link, clickEvent)

          expect(preventDefaultSpy).toHaveBeenCalled()
        })
      })
    })
  })

  describe("navigable entity types", () => {
    const navigableTypes = [
      { entityClass: "Character", expectedPath: "/characters/test-id" },
      { entityClass: "Site", expectedPath: "/sites/test-id" },
      // Note: pluralize converts "Party" to "partys" (not "parties")
      { entityClass: "Party", expectedPath: "/partys/test-id" },
      { entityClass: "Faction", expectedPath: "/factions/test-id" },
    ]

    navigableTypes.forEach(({ entityClass, expectedPath }) => {
      describe(`${entityClass} entity type`, () => {
        const entity: Entity = {
          id: "test-id",
          entity_class: entityClass,
          name: `Test ${entityClass}`,
        }

        it("has correct href attribute", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("link")
          expect(link).toHaveAttribute("href", expectedPath)
        })

        it("has target='_blank' to open in new tab", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("link")
          expect(link).toHaveAttribute("target", "_blank")
        })

        it("does not have role='button'", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("link")
          expect(link).not.toHaveAttribute("role")
        })

        it("does not have explicit tabIndex", () => {
          render(<EntityLink entity={entity} />)

          const link = screen.getByRole("link")
          // Links are naturally focusable, so tabIndex should not be explicitly set
          expect(link).not.toHaveAttribute("tabindex")
        })
      })
    })
  })

  describe("custom href override", () => {
    it("uses custom href when provided for navigable entity", () => {
      const entity: Entity = {
        id: "test-id",
        entity_class: "Character",
        name: "Test Character",
      }

      render(<EntityLink entity={entity} href="/custom/path" />)

      const link = screen.getByRole("link")
      expect(link).toHaveAttribute("href", "/custom/path")
    })
  })

  describe("data attributes", () => {
    it("sets data-mention-id attribute", () => {
      const entity: Entity = {
        id: "test-entity-id",
        entity_class: "Character",
        name: "Test Character",
      }

      render(<EntityLink entity={entity} />)

      const link = screen.getByRole("link")
      expect(link).toHaveAttribute("data-mention-id", "test-entity-id")
    })

    it("sets data-mention-class-name attribute", () => {
      const entity: Entity = {
        id: "test-id",
        entity_class: "Character",
        name: "Test Character",
      }

      render(<EntityLink entity={entity} />)

      const link = screen.getByRole("link")
      expect(link).toHaveAttribute("data-mention-class-name", "Character")
    })
  })

  describe("rendering", () => {
    it("renders entity name as link text by default", () => {
      const entity: Entity = {
        id: "test-id",
        entity_class: "Character",
        name: "John Doe",
      }

      render(<EntityLink entity={entity} />)

      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders custom children when provided", () => {
      const entity: Entity = {
        id: "test-id",
        entity_class: "Character",
        name: "John Doe",
      }

      render(<EntityLink entity={entity}>Custom Link Text</EntityLink>)

      expect(screen.getByText("Custom Link Text")).toBeInTheDocument()
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
    })

    it("renders nothing when entity is missing", () => {
      // @ts-expect-error - Testing invalid input
      render(<EntityLink entity={null} />)

      expect(screen.queryByRole("link")).not.toBeInTheDocument()
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renders nothing when entity.id is missing", () => {
      const entity: Partial<Entity> = {
        entity_class: "Character",
        name: "Test",
      }

      // @ts-expect-error - Testing invalid input
      render(<EntityLink entity={entity} />)

      expect(screen.queryByRole("link")).not.toBeInTheDocument()
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renders nothing when entity.entity_class is missing", () => {
      const entity: Partial<Entity> = {
        id: "test-id",
        name: "Test",
      }

      // @ts-expect-error - Testing invalid input
      render(<EntityLink entity={entity} />)

      expect(screen.queryByRole("link")).not.toBeInTheDocument()
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
  })
})
