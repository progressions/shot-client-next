import { Stack, Typography } from "@mui/material"
import pluralize from "pluralize"

type GridViewProps<T> = {
  resourceName: string
  entities: T[]
  handleDelete: (entity: T) => void
  DetailComponent: React.ComponentType<{
    [key: string]: T
    onDelete: (entity: T) => void
  }>
}

export function GridView<T>({
  resourceName,
  entities,
  handleDelete,
  DetailComponent,
}: GridViewProps<T>) {
  return (
    <Stack spacing={2}>
      {entities.length === 0 && (
        <Typography sx={{ color: "#ffffff" }}>
          No {pluralize(resourceName)} available
        </Typography>
      )}
      {entities.map(entity => (
        <DetailComponent
          {...{ [resourceName]: entity }}
          key={entity.id}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
