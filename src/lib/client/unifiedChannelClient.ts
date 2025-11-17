/**
 * Unified Channel Client
 *
 * Provides a consistent API for WebSocket channels that works with both:
 * - Rails ActionCable (shot-server)
 * - Phoenix Channels (shot-elixir)
 *
 * This allows the frontend to support both backends without code changes.
 */

import { createConsumer, Consumer } from "@rails/actioncable"
import { Socket, Channel } from "phoenix"

export type ChannelCallback = (data: unknown) => void

export interface UnifiedChannel {
  disconnect: () => void
}

export interface ChannelOptions {
  connected?: () => void
  disconnected?: () => void
  received: ChannelCallback
}

export interface UnifiedChannelClient {
  subscribe: (
    channelName: string,
    params: Record<string, unknown>,
    options: ChannelOptions
  ) => UnifiedChannel
  disconnect: () => void
}

/**
 * ActionCable implementation (for Rails backend)
 */
class ActionCableClient implements UnifiedChannelClient {
  private consumer: Consumer

  constructor(websocketUrl: string) {
    this.consumer = createConsumer(websocketUrl)
  }

  subscribe(
    channelName: string,
    params: Record<string, unknown>,
    options: ChannelOptions
  ): UnifiedChannel {
    const subscription = this.consumer.subscriptions.create(
      { channel: channelName, ...params },
      {
        connected: options.connected || (() => {}),
        disconnected: options.disconnected || (() => {}),
        received: options.received,
      }
    )

    return {
      disconnect: () => subscription.unsubscribe(),
    }
  }

  disconnect(): void {
    this.consumer.disconnect()
  }
}

/**
 * Phoenix Channels implementation (for Elixir backend)
 */
class PhoenixChannelClient implements UnifiedChannelClient {
  private socket: Socket
  private channels: Map<string, Channel> = new Map()

  private token: string

  constructor(websocketUrl: string, token: string) {
    // Store token as instance variable to ensure it's available in params callback
    this.token = token

    console.log(`[PhoenixChannelClient] Creating Socket connection to ${websocketUrl}`)

    this.socket = new Socket(websocketUrl, {
      params: () => ({ token: this.token }),
    })

    this.socket.onOpen(() => {
      console.log(`[PhoenixChannelClient] Socket connection opened`)
    })

    this.socket.onError((error: unknown) => {
      console.error(`[PhoenixChannelClient] Socket error:`, error)
    })

    this.socket.onClose(() => {
      console.log(`[PhoenixChannelClient] Socket connection closed`)
    })

    this.socket.connect()
    console.log(`[PhoenixChannelClient] Socket connect() called`)
  }

  subscribe(
    channelName: string,
    params: Record<string, unknown>,
    options: ChannelOptions
  ): UnifiedChannel {
    // Convert Rails channel name to Phoenix topic format
    // "CampaignChannel" with {id: "123"} -> "campaign:123"
    const topic = this.convertToPhoenixTopic(channelName, params)

    const channel = this.socket.channel(topic, params)

    // Phoenix uses event-based messages, ActionCable uses single 'received'
    // Listen for both ActionCable compatibility events and Phoenix-specific events
    channel.on("message", (payload: unknown) => {
      console.log(`[PhoenixChannelClient] Received "message" event on ${topic}:`, payload)
      options.received(payload)
    }) // ActionCable compatibility
    channel.on("update", (payload: unknown) => {
      console.log(`[PhoenixChannelClient] Received "update" event on ${topic}:`, payload)
      options.received(payload)
    }) // Phoenix Channels convention
    channel.on("broadcast", (payload: unknown) => {
      console.log(`[PhoenixChannelClient] Received "broadcast" event on ${topic}:`, payload)
      options.received(payload)
    })
    channel.on("change", (payload: unknown) => {
      console.log(`[PhoenixChannelClient] Received "change" event on ${topic}:`, payload)
      options.received(payload)
    })

    // Also listen for specific event types that might be broadcast
    channel.on("reload", options.received)
    channel.on("character_update", options.received)
    channel.on("fight_update", options.received)

    // Handle Phoenix lifecycle events
    channel.on("phx_error", () => {
      console.error(`[Phoenix] Error on channel ${topic}`)
    })

    channel.on("phx_close", () => {
      if (options.disconnected) options.disconnected()
    })

    channel
      .join()
      .receive("ok", (response: unknown) => {
        console.log(`[PhoenixChannelClient] Successfully joined channel ${topic}`, response)
        if (options.connected) options.connected()
      })
      .receive("error", (error: unknown) => {
        console.error(`[PhoenixChannelClient] Failed to join channel ${topic}:`, error)
      })

    this.channels.set(topic, channel)

    return {
      disconnect: () => {
        channel.leave()
        this.channels.delete(topic)
      },
    }
  }

  disconnect(): void {
    this.channels.forEach(channel => channel.leave())
    this.channels.clear()
    this.socket.disconnect()
  }

  private convertToPhoenixTopic(
    channelName: string,
    params: Record<string, unknown>
  ): string {
    // Convert "CampaignChannel" -> "campaign"
    const baseName = channelName.replace("Channel", "").toLowerCase()

    // If there's an id param, use Phoenix's "resource:id" format
    if (params.id) {
      return `${baseName}:${params.id}`
    }

    return baseName
  }
}

/**
 * Factory function that creates the appropriate client based on backend type
 */
export function createUnifiedChannelClient(
  websocketUrl: string,
  token: string,
  backendType: "rails" | "phoenix" = "rails"
): UnifiedChannelClient {
  if (backendType === "phoenix") {
    return new PhoenixChannelClient(websocketUrl, token)
  }

  // Default to ActionCable for backwards compatibility
  return new ActionCableClient(websocketUrl)
}

/**
 * Detect backend type from environment or URL
 */
export function detectBackendType(): "rails" | "phoenix" {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ""
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ""

  // Check if using Elixir backend (port 4002) or Phoenix-specific env var
  if (
    serverUrl.includes(":4002") ||
    websocketUrl.includes(":4002") ||
    process.env.NEXT_PUBLIC_BACKEND_TYPE === "phoenix"
  ) {
    return "phoenix"
  }

  return "rails"
}
