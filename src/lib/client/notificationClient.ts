import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  DismissAllResponse,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
}

export function createNotificationClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, patch, post, delete: delete_ } = createBaseClient(deps)

  async function getNotifications(params?: {
    status?: "unread"
    limit?: number
  }): Promise<AxiosResponse<NotificationsResponse>> {
    const url = params
      ? `${apiV2.notifications()}?${new URLSearchParams(params as Record<string, string>).toString()}`
      : apiV2.notifications()
    return get(url)
  }

  async function getNotification(
    id: string
  ): Promise<AxiosResponse<Notification>> {
    return get(apiV2.notifications({ id }))
  }

  async function updateNotification(
    id: string,
    payload: {
      read_at?: string
      dismissed_at?: string
    }
  ): Promise<AxiosResponse<Notification>> {
    return patch(apiV2.notifications({ id }), { notification: payload })
  }

  async function deleteNotification(id: string): Promise<AxiosResponse<void>> {
    return delete_(apiV2.notifications({ id }))
  }

  async function getUnreadCount(): Promise<AxiosResponse<UnreadCountResponse>> {
    return get(apiV2.notificationsUnreadCount())
  }

  async function dismissAllNotifications(): Promise<
    AxiosResponse<DismissAllResponse>
  > {
    return post(apiV2.notificationsDismissAll(), {})
  }

  async function markAsRead(id: string): Promise<AxiosResponse<Notification>> {
    return updateNotification(id, { read_at: new Date().toISOString() })
  }

  async function dismissNotification(
    id: string
  ): Promise<AxiosResponse<Notification>> {
    return updateNotification(id, { dismissed_at: new Date().toISOString() })
  }

  return {
    getNotifications,
    getNotification,
    updateNotification,
    deleteNotification,
    getUnreadCount,
    dismissAllNotifications,
    markAsRead,
    dismissNotification,
  }
}
