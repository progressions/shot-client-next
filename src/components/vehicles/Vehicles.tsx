"use client"

import { useRouter } from "next/navigation"
import { useMemo, useEffect, useCallback, useState } from "react"
import {
  Pagination,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  useMediaQuery,
} from "@mui/material"
import { GridView, ViewList } from "@mui/icons-material"
import Link from "next/link"
import type { Vehicle, PaginationMeta } from "@/types"
import { useCampaign, useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import {
  VehiclesMobile,
  VehicleFilter,
  SpeedDial,
  VehicleName,
} from "@/components/vehicles"
import { CS } from "@/services"
import { FormActions, useForm } from "@/reducers"
import { HeroTitle } from "@/components/ui"
import { queryParams } from "@/lib"
import { actions as initialActions } from "@/components/vehicles/SpeedDial"

interface VehiclesProperties {
  initialVehicles: Vehicle[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile: boolean
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
const _validSorts: readonly ValidSort[] = [
  "name",
  "type",
  "created_at",
  "updated_at",
]

type ValidOrder = "asc" | "desc"

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
  vehicle_type: string
  archetype: string
  faction_id: string
}

export default function Vehicles({
  initialVehicles,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: VehiclesProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const router = useRouter()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const isMobile = initialIsMobile || smallScreen

  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    isMobile ? "mobile" : "table"
  )

  const { formState, dispatchForm } = useForm<FormStateData>({
    vehicles: initialVehicles,
    meta: initialMeta,
    sort: initialSort,
    order: initialOrder,
    vehicle_type: "",
    archetype: "",
    faction_id: "",
  })

  const { vehicles, meta, sort, order, vehicle_type, archetype, faction_id } =
    formState.data

  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchVehicles = useCallback(
    async (
      page: number = 1,
      sort: string = "name",
      order: string = "asc",
      vehicle_type: string = "",
      faction_id: string = "",
      archetype: string = ""
    ) => {
      try {
        const response = await client.getVehicles({
          archetype,
          page,
          sort,
          order,
          type: vehicle_type,
          faction_id,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "vehicles",
          value: response.data.vehicles,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch vehicles error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.vehicles === "reload") {
      fetchVehicles(
        meta.current_page,
        sort,
        order,
        vehicle_type,
        faction_id,
        archetype
      )
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchVehicles,
    validOrders,
    archetype,
    faction_id,
    vehicle_type,
    sort,
    order,
    meta.current_page,
  ])

  useEffect(() => {
    const url = `/vehicles?${queryParams({
      page: 1,
      sort,
      order,
      type: vehicle_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(1, sort, order, vehicle_type, faction_id, archetype)
  }, [vehicle_type, archetype, faction_id, fetchVehicles, order, router, sort])

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      const url = `/vehicles?${queryParams({
        page: 1,
        sort,
        order,
        type: vehicle_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchVehicles(1, sort, order)
    } else {
      const url = `/vehicles?${queryParams({
        page,
        sort,
        order,
        type: vehicle_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchVehicles(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/vehicles?${queryParams({
      page: 1,
      sort: newSort,
      order: newOrder,
      type: vehicle_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(1, newSort, newOrder)
  }

  const handleToggleView = () => {
    setViewMode(viewMode === "table" ? "mobile" : "table")
  }

  const formatDate = (date: string) => {
    if (viewMode === "mobile") {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
    }
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const actions = [
    {
      icon: viewMode === "table" ? <GridView /> : <ViewList />,
      name:
        viewMode === "table" ? "Switch to Mobile View" : "Switch to Table View",
      onClick: handleToggleView,
    },
    ...initialActions,
  ]

  return (
    <>
      <SpeedDial actions={actions} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <HeroTitle>Vehicles</HeroTitle>
      </Box>
      <Box sx={{ width: "100%", mb: 2 }}>
        {viewMode === "mobile" ? (
          <VehiclesMobile
            formState={formState}
            dispatchForm={dispatchForm}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onOrderChange={() => handleSortChange(sort as ValidSort)}
            initialIsMobile={initialIsMobile}
          />
        ) : (
          <>
            <VehicleFilter dispatch={dispatchForm} includeVehicles={false} />
            <Box sx={{ bgcolor: "#424242", borderRadius: 1 }}>
              <Table
                sx={{
                  maxWidth: { xs: "400px", sm: "100%" },
                  tableLayout: "fixed",
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#ffffff" }}>
                      <TableSortLabel
                        active={sort === "name"}
                        direction={
                          sort === "name" ? (order as ValidOrder) : "asc"
                        }
                        onClick={() => handleSortChange("name")}
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
                        active={sort === "type"}
                        direction={
                          sort === "type" ? (order as ValidOrder) : "asc"
                        }
                        onClick={() => handleSortChange("type")}
                        sx={{
                          color: "#ffffff",
                          "&.Mui-active": { color: "#ffffff" },
                          "& .MuiTableSortLabel-icon": {
                            color: "#ffffff !important",
                          },
                        }}
                      >
                        Type
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
                        direction={
                          sort === "created_at" ? (order as ValidOrder) : "asc"
                        }
                        onClick={() => handleSortChange("created_at")}
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
                    <TableCell
                      sx={{
                        color: "#ffffff",
                        width: { xs: "60px", sm: "100px" },
                        textAlign: "center",
                        padding: { xs: "8px 4px", sm: "16px 8px" },
                      }}
                    >
                      Active
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
                        No vehicles available
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map(vehicle => (
                      <TableRow
                        key={vehicle.id}
                        sx={{ "&:hover": { bgcolor: "#616161" } }}
                      >
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            style={{
                              color: "#ffffff",
                              textDecoration: "underline",
                            }}
                          >
                            <VehicleName vehicle={vehicle} />
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            width: { xs: "65px", sm: "150px" },
                          }}
                        >
                          {CS.type(vehicle)}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            width: { xs: "65px", sm: "150px" },
                          }}
                        >
                          {formatDate(vehicle.created_at || "")}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            width: { xs: "60px", sm: "100px" },
                            textAlign: "center",
                            padding: { xs: "8px 4px", sm: "16px 8px" },
                          }}
                        >
                          {vehicle.active ? "Yes" : "No"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
            <Pagination
              count={meta.total_pages}
              page={meta.current_page}
              onChange={handlePageChange}
              variant="outlined"
              color="primary"
              shape="rounded"
              size="large"
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    </>
  )
}
