"use client"

import React, { useState } from "react"
import { Box, IconButton, Paper } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

interface CarouselProps {
  items: { id: number; content: string }[]
  onSelect?: (item: { id: number; content: string }) => void
}

export function Carousel({ items, onSelect }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1))
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 800,
        mx: "auto",
      }}
    >
      <Paper
        elevation={3}
        sx={{ overflow: "hidden", borderRadius: 2, bgcolor: "grey.900" }}
      >
        <Box
          sx={{
            display: "flex",
            transition: "transform 0.3s ease",
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {items.map(item => (
            <Box
              key={item.id}
              sx={{
                minWidth: "100%",
                height: 900,
                display: "flex",
                flexDirection: "column",
                bgcolor: "grey.800",
                color: "white",
                flexShrink: 0,
                p: 2,
                pb: 8,
                overflow: "scroll",
                position: "relative",
              }}
            >
              {onSelect && (
                <IconButton
                  onClick={() => onSelect(item)}
                  data-testid="carousel-select-button"
                  aria-label="Select this template"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    zIndex: 1,
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: "2rem" }} />
                </IconButton>
              )}
              {item.content}
            </Box>
          ))}
        </Box>
      </Paper>
      <IconButton
        onClick={handlePrev}
        sx={{
          position: "absolute",
          top: "50%",
          left: -20,
          transform: "translateY(-50%)",
          bgcolor: "grey.900",
          color: "white",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          top: "50%",
          right: -20,
          transform: "translateY(-50%)",
          bgcolor: "grey.900",
          color: "white",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  )
}
