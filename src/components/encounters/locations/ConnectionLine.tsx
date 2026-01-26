"use client"

import { useState, useMemo } from "react"
import type { LocationConnection, Location } from "@/types"
import {
  CONNECTION_LINE_COLOR,
  CONNECTION_LINE_WIDTH,
  CONNECTION_LINE_HOVER_WIDTH,
  CONNECTION_HIT_WIDTH,
  ARROWHEAD_SIZE,
  DEFAULT_ZONE_WIDTH,
  DEFAULT_ZONE_HEIGHT,
} from "./constants"

interface ConnectionLineProps {
  connection: LocationConnection
  locations: Location[]
  isSelected?: boolean
  onClick?: (connection: LocationConnection) => void
}

interface Point {
  x: number
  y: number
}

/**
 * Calculate the center point of a location zone
 */
function getZoneCenter(location: Location): Point {
  const x =
    (location.position_x ?? 0) + (location.width ?? DEFAULT_ZONE_WIDTH) / 2
  const y =
    (location.position_y ?? 0) + (location.height ?? DEFAULT_ZONE_HEIGHT) / 2
  return { x, y }
}

/**
 * Calculate the intersection point where a line from center exits a rectangle
 */
function getEdgeIntersection(
  center: Point,
  target: Point,
  width: number,
  height: number
): Point {
  const dx = target.x - center.x
  const dy = target.y - center.y

  if (dx === 0 && dy === 0) {
    return center
  }

  const halfWidth = width / 2
  const halfHeight = height / 2

  // Calculate the intersection with each edge
  const tX = dx !== 0 ? halfWidth / Math.abs(dx) : Infinity
  const tY = dy !== 0 ? halfHeight / Math.abs(dy) : Infinity
  const t = Math.min(tX, tY)

  return {
    x: center.x + dx * t,
    y: center.y + dy * t,
  }
}

/**
 * ConnectionLine renders an SVG line between two location zones.
 * Shows an arrowhead for one-way connections and a label at the midpoint.
 */
export default function ConnectionLine({
  connection,
  locations,
  isSelected = false,
  onClick,
}: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Find the from and to locations
  const fromLocation = locations.find(l => l.id === connection.from_location_id)
  const toLocation = locations.find(l => l.id === connection.to_location_id)

  // Calculate line endpoints
  const { fromPoint, toPoint, midPoint } = useMemo(() => {
    if (!fromLocation || !toLocation) {
      return { fromPoint: null, toPoint: null, midPoint: null }
    }

    const fromCenter = getZoneCenter(fromLocation)
    const toCenter = getZoneCenter(toLocation)

    // Calculate edge intersection points for cleaner visuals
    const fromEdge = getEdgeIntersection(
      fromCenter,
      toCenter,
      fromLocation.width ?? DEFAULT_ZONE_WIDTH,
      fromLocation.height ?? DEFAULT_ZONE_HEIGHT
    )
    const toEdge = getEdgeIntersection(
      toCenter,
      fromCenter,
      toLocation.width ?? DEFAULT_ZONE_WIDTH,
      toLocation.height ?? DEFAULT_ZONE_HEIGHT
    )

    const mid = {
      x: (fromEdge.x + toEdge.x) / 2,
      y: (fromEdge.y + toEdge.y) / 2,
    }

    return { fromPoint: fromEdge, toPoint: toEdge, midPoint: mid }
  }, [fromLocation, toLocation])

  if (!fromPoint || !toPoint || !midPoint) {
    return null
  }

  const lineWidth =
    isHovered || isSelected
      ? CONNECTION_LINE_HOVER_WIDTH
      : CONNECTION_LINE_WIDTH
  const lineColor = isSelected ? "#f50057" : CONNECTION_LINE_COLOR

  // Unique ID for the arrowhead marker
  const markerId = `arrowhead-${connection.id}`

  return (
    <g>
      {/* Arrowhead marker definition (only for one-way connections) */}
      {!connection.bidirectional && (
        <defs>
          <marker
            id={markerId}
            markerWidth={ARROWHEAD_SIZE}
            markerHeight={ARROWHEAD_SIZE}
            refX={ARROWHEAD_SIZE - 1}
            refY={ARROWHEAD_SIZE / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon
              points={`0,0 ${ARROWHEAD_SIZE},${ARROWHEAD_SIZE / 2} 0,${ARROWHEAD_SIZE}`}
              fill={lineColor}
            />
          </marker>
        </defs>
      )}

      {/* Invisible wider stroke for easier clicking */}
      <line
        x1={fromPoint.x}
        y1={fromPoint.y}
        x2={toPoint.x}
        y2={toPoint.y}
        stroke="transparent"
        strokeWidth={CONNECTION_HIT_WIDTH}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
        onClick={() => onClick?.(connection)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible connection line */}
      <line
        x1={fromPoint.x}
        y1={fromPoint.y}
        x2={toPoint.x}
        y2={toPoint.y}
        stroke={lineColor}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        markerEnd={!connection.bidirectional ? `url(#${markerId})` : undefined}
        style={{ pointerEvents: "none" }}
      />

      {/* Label at midpoint */}
      {connection.label && (
        <g transform={`translate(${midPoint.x}, ${midPoint.y})`}>
          {/* Background for readability - uses generous padding for variable-width fonts */}
          <rect
            x={-connection.label.length * 4 - 8}
            y={-10}
            width={connection.label.length * 8 + 16}
            height={20}
            fill="white"
            fillOpacity={0.9}
            rx={4}
            style={{ pointerEvents: "none" }}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill={lineColor}
            fontWeight={isHovered || isSelected ? "bold" : "normal"}
            style={{ pointerEvents: "none" }}
          >
            {connection.label}
          </text>
        </g>
      )}
    </g>
  )
}
