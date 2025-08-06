import { motion } from "motion/react"
import type { Vehicle } from "@/types"
import { ListItemIcon, ListItemText, ListItem } from "@mui/material"
import {
  VehicleHeader,
  ChaseConditionPoints,
  Vehicle,
} from "@/components/encounters"
import { encounterTransition } from "@/contexts"

type VehicleDetailProps = {
  vehicle: Vehicle
}

export default function VehicleDetail({ vehicle }: VehicleDetailProps) {
  return (
    <motion.div
      key={vehicle.shot_id}
      layout
      layoutId={`vehicle-${vehicle.id}`}
      transition={encounterTransition}
    >
      <ListItem sx={{ alignItems: "flex-start" }}>
        <ListItemIcon>
          <ChaseConditionPoints vehicle={vehicle} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: 2 }}
          primary={<VehicleHeader vehicle={vehicle} />}
          secondary={<Vehicle vehicle={vehicle} />}
        />
      </ListItem>
    </motion.div>
  )
}
