"use client"

import React, { useEffect, useState } from "react"
import { Box, Typography, Paper, IconButton } from "@mui/material"
import { Close } from "@mui/icons-material"
import { createPortal } from "react-dom"

export interface OnboardingPointerProps {
  targetElement: string
  title: string
  description: string
  onDismiss?: () => void
  position?: "top" | "bottom" | "left" | "right"
  offset?: number
}

export const OnboardingPointer: React.FC<OnboardingPointerProps> = ({
  targetElement,
  title,
  description,
  onDismiss,
  position = "top",
  offset = 16,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const findAndPositionTarget = () => {
      const element =
        document.querySelector(`[data-onboarding="${targetElement}"]`) ||
        document.getElementById(targetElement) ||
        document.querySelector(`.${targetElement}`)

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        setIsVisible(true)

        // Add highlight effect to target element
        element.classList.add("onboarding-highlight")

        return () => {
          element.classList.remove("onboarding-highlight")
        }
      }
    }

    // Try to find element immediately
    const cleanup = findAndPositionTarget()

    // Also try after a short delay in case element is being rendered
    const timeoutId = setTimeout(findAndPositionTarget, 100)

    // Listen for resize events
    const handleResize = () => {
      findAndPositionTarget()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cleanup?.()
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
    }
  }, [targetElement])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!targetRect || !isVisible) {
    return null
  }

  const getPointerPosition = () => {
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    switch (position) {
      case "top":
        return {
          left: scrollX + targetRect.left + targetRect.width / 2,
          top: scrollY + targetRect.top - offset,
          transform: "translateX(-50%) translateY(-100%)",
        }
      case "bottom":
        return {
          left: scrollX + targetRect.left + targetRect.width / 2,
          top: scrollY + targetRect.bottom + offset,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          left: scrollX + targetRect.left - offset,
          top: scrollY + targetRect.top + targetRect.height / 2,
          transform: "translateX(-100%) translateY(-50%)",
        }
      case "right":
        return {
          left: scrollX + targetRect.right + offset,
          top: scrollY + targetRect.top + targetRect.height / 2,
          transform: "translateY(-50%)",
        }
      default:
        return {
          left: scrollX + targetRect.left + targetRect.width / 2,
          top: scrollY + targetRect.top - offset,
          transform: "translateX(-50%) translateY(-100%)",
        }
    }
  }

  const getArrowStyles = () => {
    const arrowSize = 8
    switch (position) {
      case "top":
        return {
          content: '""',
          position: "absolute" as const,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid`,
          borderTopColor: "inherit",
        }
      case "bottom":
        return {
          content: '""',
          position: "absolute" as const,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid`,
          borderBottomColor: "inherit",
        }
      case "left":
        return {
          content: '""',
          position: "absolute" as const,
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid`,
          borderLeftColor: "inherit",
        }
      case "right":
        return {
          content: '""',
          position: "absolute" as const,
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid`,
          borderRightColor: "inherit",
        }
      default:
        return {}
    }
  }

  const pointerPosition = getPointerPosition()

  return createPortal(
    <>
      {/* Overlay backdrop */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />

      {/* Pointer tooltip */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 9999,
          maxWidth: 320,
          minWidth: 240,
          ...pointerPosition,
          animation: "onboardingFadeIn 0.3s ease-out",
          "@keyframes onboardingFadeIn": {
            "0%": {
              opacity: 0,
              transform: `${pointerPosition.transform} scale(0.9)`,
            },
            "100%": {
              opacity: 1,
              transform: pointerPosition.transform,
            },
          },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            backgroundColor: "info.main",
            color: "white",
            borderRadius: 2,
            position: "relative",
            "&::before": getArrowStyles(),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {description}
              </Typography>
            </Box>
            {onDismiss && (
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{
                  color: "white",
                  ml: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Global styles for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 9999;
        }

        .onboarding-highlight::before {
          content: "";
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid #1976d2;
          border-radius: 8px;
          animation: onboardingPulse 2s infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes onboardingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
          }
        }

        .onboarding-highlight.onboarding-highlight--fab::before {
          border-radius: 50%;
        }
      `}</style>
    </>,
    document.body
  )
}
