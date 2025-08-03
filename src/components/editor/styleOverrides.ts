export const styleOverrides = {
  "& .MuiTiptap-FieldContainer-root, & .MuiTiptap-FieldContainer-root.MuiTiptap-FieldContainer-outlined":
    {
      border: "none !important",
      borderRadius: "8px",
      "&:hover": {
        border: "none !important",
      },
      "&.Mui-focused": {
        border: "none !important",
      },
      "&:hover .MuiTiptap-FieldContainer-notchedOutline": {
        border: "none !important",
      },
      "&.Mui-focused .MuiTiptap-FieldContainer-notchedOutline": {
        border: "none !important",
      },
    },
  "& .MuiTiptap-FieldContainer-notchedOutline": {
    border: "none !important",
    "&:hover": {
      border: "none !important",
    },
    "&.Mui-focused": {
      border: "none !important",
    },
    "&[class*='MuiTiptap-FieldContainer-notchedOutline'][class*='mui-']": {
      border: "none !important",
      "&:hover": {
        border: "none !important",
      },
    },
  },
  "& .MuiRichTextEditor-root, & .MuiTiptap-RichTextContent-root, & .ProseMirror":
    {
      border: "none !important",
      "&:hover": {
        border: "none !important",
      },
      "&:focus": {
        border: "none !important",
      },
    },
}
