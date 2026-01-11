"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material"
import NotificationsIcon from "@mui/icons-material/Notifications"
import CloseIcon from "@mui/icons-material/Close"
import { useClient } from "@/contexts"
import type { Notification } from "@/types"

export function NotificationBell() {
  const { client, jwt } = useClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const open = Boolean(anchorEl)

  const fetchUnreadCount = useCallback(async () => {
    if (!jwt) return // Don't fetch if not authenticated
    try {
      const response = await client.getUnreadCount()
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }, [client, jwt])

  const fetchNotifications = useCallback(async () => {
    if (!jwt) return // Don't fetch if not authenticated
    setLoading(true)
    try {
      const response = await client.getNotifications({ limit: 10 })
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [client, jwt])

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    fetchNotifications()
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDismiss = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      // Find the notification to check if it was unread
      const notification = notifications.find(n => n.id === id)
      await client.dismissNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      // Only decrement unread count if the notification was unread
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error)
    }
  }

  const handleDismissAll = async () => {
    try {
      await client.dismissAllNotifications()
      setNotifications([])
      setUnreadCount(0)
      handleMenuClose()
    } catch (error) {
      console.error("Failed to dismiss all notifications:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        aria-label="Notifications"
        sx={{
          color: "#ffffff",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              minWidth: "16px",
              height: "16px",
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            bgcolor: "#1d1d1d",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
            mt: 1,
            minWidth: 320,
            maxWidth: 360,
            maxHeight: 400,
            "& .MuiMenuItem-root": {
              "&:hover": { bgcolor: "#333333" },
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={handleDismissAll}
              sx={{ color: "#888", textTransform: "none", fontSize: "0.75rem" }}
            >
              Dismiss all
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: "#2a2a2a" }} />

        {loading ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map(notification => (
            <MenuItem
              key={notification.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                py: 1.5,
                px: 2,
                whiteSpace: "normal",
                bgcolor: notification.read_at
                  ? "transparent"
                  : "rgba(255, 255, 255, 0.03)",
              }}
            >
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: notification.read_at ? 400 : 600,
                    mb: 0.5,
                  }}
                >
                  {notification.title}
                </Typography>
                {notification.message && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#888", display: "block", mb: 0.5 }}
                  >
                    {notification.message}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: "#666" }}>
                  {formatTimeAgo(notification.created_at)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={e => handleDismiss(notification.id, e)}
                sx={{
                  color: "#666",
                  p: 0.5,
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}
