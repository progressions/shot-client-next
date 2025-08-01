"use client"

import React, { useState } from "react"
import { Box, IconButton, Paper, Button } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"

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
        maxWidth: 600,
        mx: "auto",
        my: 4,
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
                px: 4,
                pt: 1,
                pb: 4,
                overflow: "scroll",
              }}
            >
              {onSelect && (
                <Button
                  variant="contained"
                  onClick={() => onSelect(item)}
                  sx={{
                    alignSelf: "center",
                    mb: 2,
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    minWidth: 150,
                    fontSize: "1rem",
                  }}
                >
                  Select
                </Button>
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
