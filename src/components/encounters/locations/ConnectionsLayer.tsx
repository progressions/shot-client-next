"use client"

import type { LocationConnection, Location } from "@/types"
import ConnectionLine from "./ConnectionLine"
import {
  CONNECTION_LINE_COLOR,
  CONNECTION_LINE_WIDTH,
  DEFAULT_ZONE_WIDTH,
  DEFAULT_ZONE_HEIGHT,
} from "./constants"

interface ConnectionsLayerProps {
  connections: LocationConnection[]
  locations: Location[]
  selectedConnection: LocationConnection | null
  onConnectionClick: (connection: LocationConnection) => void
  /** Preview line during connection creation */
  previewLine?: {
    fromLocationId: string
    toPoint: { x: number; y: number }
  } | null
  width: number
  height: number
}

/**
 * ConnectionsLayer renders all connection lines as an SVG overlay.
 * Positioned absolutely over the canvas with pointer-events: none on container,
 * but pointer-events: auto on individual lines for clicking.
 */
export default function ConnectionsLayer({
  connections,
  locations,
  selectedConnection,
  onConnectionClick,
  previewLine,
  width,
  height,
}: ConnectionsLayerProps) {
  // Calculate preview line start point
  const previewFromPoint = previewLine
    ? (() => {
        const fromLocation = locations.find(
          l => l.id === previewLine.fromLocationId
        )
        if (!fromLocation) return null
        return {
          x:
            (fromLocation.position_x ?? 0) +
            (fromLocation.width ?? DEFAULT_ZONE_WIDTH) / 2,
          y:
            (fromLocation.position_y ?? 0) +
            (fromLocation.height ?? DEFAULT_ZONE_HEIGHT) / 2,
        }
      })()
    : null

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* Render all connections */}
      {connections.map(connection => (
        <ConnectionLine
          key={connection.id}
          connection={connection}
          locations={locations}
          isSelected={selectedConnection?.id === connection.id}
          onClick={onConnectionClick}
        />
      ))}

      {/* Preview line during connection creation */}
      {previewLine && previewFromPoint && (
        <line
          x1={previewFromPoint.x}
          y1={previewFromPoint.y}
          x2={previewLine.toPoint.x}
          y2={previewLine.toPoint.y}
          stroke={CONNECTION_LINE_COLOR}
          strokeWidth={CONNECTION_LINE_WIDTH}
          strokeDasharray="5,5"
          opacity={0.6}
          style={{ pointerEvents: "none" }}
        />
      )}
    </svg>
  )
}
