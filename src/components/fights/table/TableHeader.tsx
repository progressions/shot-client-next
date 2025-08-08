import { TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material"

interface FightsTableHeaderProps {
  sort: string
  order: string
  onSortChange: (newSort: ValidSort) => void
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
type ValidOrder = "asc" | "desc"

export default function FightsTableHeader({
  sort,
  order,
  onSortChange,
}: FightsTableHeaderProps) {
  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: "#ffffff" }}>
          <TableSortLabel
            active={sort === "name"}
            direction={sort === "name" ? (order as ValidOrder) : "asc"}
            onClick={() => onSortChange("name")}
            sx={{
              color: "#ffffff",
              "&.Mui-active": { color: "#ffffff" },
              "& .MuiTableSortLabel-icon": {
                color: "#ffffff !important",
              },
            }}
          >
            Name
          </TableSortLabel>
        </TableCell>
        <TableCell
          sx={{
            color: "#ffffff",
            width: { xs: "65px", sm: "150px" },
          }}
        >
          <TableSortLabel
            active={sort === "created_at"}
            direction={sort === "created_at" ? (order as ValidOrder) : "asc"}
            onClick={() => onSortChange("created_at")}
            sx={{
              color: "#ffffff",
              "&.Mui-active": { color: "#ffffff" },
              "& .MuiTableSortLabel-icon": {
                color: "#ffffff !important",
              },
            }}
          >
            Created
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  )
}
