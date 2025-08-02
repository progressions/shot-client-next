import { Button } from "@mui/material"

type ImageAttacherProps = {
  imageUrl: string
  onSelect: (imageUrl: string) => void
}

export function ImageAttacher({ imageUrl, onSelect }: ImageAttacherProps) {
  const handleSelectImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    await onSelect(imageUrl)
  }

  return (
    <Button
      variant="contained"
      size="small"
      sx={{
        bgcolor: "primary.main",
        color: "white",
        "&:hover": { bgcolor: "primary.dark" },
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
      }}
      onClick={handleSelectImage}
    >
      Choose
    </Button>
  )
}
