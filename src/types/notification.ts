export interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  payload: Record<string, unknown>
  read_at: string | null
  dismissed_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface DismissAllResponse {
  dismissed_count: number
}
