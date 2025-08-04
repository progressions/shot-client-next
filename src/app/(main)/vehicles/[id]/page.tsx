import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Stack, Container, Typography, Box, Avatar } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import type { Vehicle } from "@/types"
import type { Metadata } from "next"
import { VehicleName } from "@/components/vehicles"
import { VS } from "@/services"
import Breadcrumbs from "@/components/Breadcrumbs"

// Component for vehicle not found
function VehicleNotFound() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "#424242", p: 2, borderRadius: 1 }}>
        <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
          Vehicle Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          The vehicle you’re looking for does not exist or is not accessible.
        </Typography>
      </Box>
    </Container>
  )
}

// Dynamically generate metadata for the page title
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    return { title: "Vehicle - Chi War" }
  }

  const { id } = await params

  try {
    const response = await client.getVehicle({ id })
    const vehicle: Vehicle = response.data
    if (!vehicle) {
      return { title: "Vehicle Not Found - Chi War" }
    }
    return { title: `${vehicle.name} - Chi War` }
  } catch (error) {
    console.error("Fetch vehicle error for metadata:", error)
    return { title: "Vehicle Not Found - Chi War" }
  }
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const { id } = await params

  let vehicle: Vehicle | null = null
  try {
    const response = await client.getVehicle({ id })
    vehicle = response.data
    console.log("vehicle data:", vehicle)
  } catch (error) {
    console.error("Fetch vehicle error:", error)
  }

  if (!vehicle?.id) {
    return <VehicleNotFound />
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Stack
        direction="row"
        sx={{ alignItems: "center", mb: 2, gap: { xs: 1, sm: 2 } }}
      >
        <Avatar
          src={vehicle.image_url ?? undefined}
          alt={vehicle.name}
          sx={{ width: { xs: 40, sm: 64 }, height: { xs: 40, sm: 64 } }}
        />
        <Stack direction="column">
          <Typography
            variant="h3"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1.75rem", sm: "2.5rem" },
            }}
          >
            <VehicleName vehicle={vehicle} />
            {VS.isTask(vehicle) && " (Task)"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {VS.type(vehicle)}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          columnGap: { xs: 1, sm: 2 },
          rowGap: { xs: 1, sm: 1.5 },
          mb: 3,
        }}
      >
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Acceleration
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {VS.acceleration(vehicle)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Handling
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {VS.handling(vehicle)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Squeal
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {VS.squeal(vehicle)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Frame
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {VS.frame(vehicle)}
          </Box>
        </Stack>
        <Stack direction="column">
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Crunch
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              minWidth: { xs: "5rem", sm: "6rem" },
              fontSize: { xs: "2rem", sm: "3rem" },
              border: "1px solid #ffffff",
              borderRadius: 1,
              p: 1,
              px: 2,
            }}
          >
            {VS.crunch(vehicle)}
          </Box>
        </Stack>
      </Stack>
    </>
  )
}
