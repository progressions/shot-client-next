"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useHotkeys } from "@/contexts"
import { HotkeyHelpModal } from "./HotkeyHelpModal"
import { CommandModeIndicator } from "./CommandModeIndicator"

/**
 * Global hotkey registrations for navigation throughout the app
 * Renders the help modal and command mode indicator
 */
export function GlobalHotkeys() {
  const router = useRouter()
  const { registerHotkey } = useHotkeys()

  useEffect(() => {
    const cleanups: Array<() => void> = []

    // G (Go) commands - navigate to index pages
    cleanups.push(
      registerHotkey("g+h", () => router.push("/"), {
        description: "Go to Home",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+a", () => router.push("/adventures"), {
        description: "Go to Adventures",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+c", () => router.push("/characters"), {
        description: "Go to Characters",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+v", () => router.push("/vehicles"), {
        description: "Go to Vehicles",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+f", () => router.push("/fights"), {
        description: "Go to Fights",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+p", () => router.push("/parties"), {
        description: "Go to Parties",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+s", () => router.push("/sites"), {
        description: "Go to Sites",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+w", () => router.push("/weapons"), {
        description: "Go to Weapons",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+j", () => router.push("/junctures"), {
        description: "Go to Junctures",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+x", () => router.push("/factions"), {
        description: "Go to Factions",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+k", () => router.push("/schticks"), {
        description: "Go to Schticks",
        category: "Navigation",
      })
    )

    cleanups.push(
      registerHotkey("g+g", () => router.push("/campaigns"), {
        description: "Go to Campaigns",
        category: "Navigation",
      })
    )

    // N (New) commands - navigate to create pages
    cleanups.push(
      registerHotkey("n+a", () => router.push("/adventures/new"), {
        description: "New Adventure",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+c", () => router.push("/characters/create"), {
        description: "New Character",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+v", () => router.push("/vehicles/new"), {
        description: "New Vehicle",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+f", () => router.push("/fights/new"), {
        description: "New Fight",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+p", () => router.push("/parties/new"), {
        description: "New Party",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+s", () => router.push("/sites/new"), {
        description: "New Site",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+w", () => router.push("/weapons/new"), {
        description: "New Weapon",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+k", () => router.push("/schticks/new"), {
        description: "New Schtick",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+x", () => router.push("/factions/new"), {
        description: "New Faction",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+g", () => router.push("/campaigns/new"), {
        description: "New Campaign",
        category: "Create New",
      })
    )

    cleanups.push(
      registerHotkey("n+j", () => router.push("/junctures/new"), {
        description: "New Juncture",
        category: "Create New",
      })
    )

    // Register ? for help (description only - handling is in context)
    cleanups.push(
      registerHotkey("?", () => {}, {
        description: "Show keyboard shortcuts",
        category: "General",
      })
    )

    // Cleanup all registrations on unmount
    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [registerHotkey, router])

  return (
    <>
      <HotkeyHelpModal />
      <CommandModeIndicator />
    </>
  )
}
