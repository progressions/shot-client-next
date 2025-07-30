import { Card as MuiCard, CardProps as MuiCardProperties } from "@mui/material"

export function Card(properties: MuiCardProperties) {
  return <MuiCard {...properties} />
}
