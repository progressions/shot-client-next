/**
 * Unified Channel Client
 *
 * Provides a consistent API for WebSocket channels that works with both:
 * - Rails ActionCable (shot-server)
 * - Phoenix Channels (shot-elixir)
 *
 * This allows the frontend to support both backends without code changes.
 */

import { createConsumer, Consumer, Subscription } from "@rails/actioncable"
import { Socket, Channel } from "phoenix"

export type ChannelCallback = (data: any) => void

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
    params: Record<string, any>,
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
    params: Record<string, any>,
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
    console.log("[PhoenixChannelClient] Constructor called with:")
    console.log("  - websocketUrl:", websocketUrl)
    console.log("  - token:", token ? `${token.substring(0, 20)}...` : "EMPTY OR UNDEFINED")
    console.log("  - token length:", token?.length)
    console.log("  - token typeof:", typeof token)

    // Store token as instance variable to ensure it's available in params callback
    this.token = token
    console.log("  - Stored token length:", this.token?.length)

    this.socket = new Socket(websocketUrl, {
      params: () => {
        console.log("[PhoenixChannelClient] params callback invoked")
        console.log("  - this.token length:", this.token?.length)
        console.log("  - this.token value:", this.token ? `${this.token.substring(0, 20)}...` : "EMPTY")
        const params = { token: this.token }
        console.log("  - returning params:", params)
        return params
      }
    })

    // Log the endpoint URL that will be used
    console.log("[PhoenixChannelClient] Socket endPoint:", (this.socket as any).endPoint)
    console.log("[PhoenixChannelClient] Socket params:", typeof (this.socket as any).params)

    console.log("[PhoenixChannelClient] Socket created, connecting...")
    this.socket.connect()

    // After connect, check the actual connection URL
    setTimeout(() => {
      const conn = (this.socket as any).conn
      console.log("[PhoenixChannelClient] WebSocket URL:", conn?.url)
    }, 100)

    console.log("[PhoenixChannelClient] Connect called")
  }

  subscribe(
    channelName: string,
    params: Record<string, any>,
    options: ChannelOptions
  ): UnifiedChannel {
    // Convert Rails channel name to Phoenix topic format
    // "CampaignChannel" with {id: "123"} -> "campaign:123"
    const topic = this.convertToPhoenixTopic(channelName, params)

    console.log(`[PhoenixChannelClient] Subscribing to topic: ${topic}`)

    const channel = this.socket.channel(topic, params)

    // Phoenix uses event-based messages, ActionCable uses single 'received'
    // Listen for both ActionCable compatibility events and Phoenix-specific events
    channel.on("message", (payload) => {
      console.log(`[PhoenixChannelClient] Received 'message' on ${topic}:`, payload)
      options.received(payload)
    })
    channel.on("update", (payload) => {
      console.log(`[PhoenixChannelClient] Received 'update' on ${topic}:`, payload)
      options.received(payload)
    })
    channel.on("broadcast", options.received)
    channel.on("change", options.received)

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
      .receive("ok", () => {
        if (options.connected) options.connected()
      })
      .receive("error", (error: any) => {
        console.error(`[Phoenix] Failed to join channel ${topic}:`, error)
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
    params: Record<string, any>
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
  console.log("[createUnifiedChannelClient] Called with:")
  console.log("  - websocketUrl:", websocketUrl)
  console.log("  - token:", token ? `${token.substring(0, 20)}...` : "EMPTY OR UNDEFINED")
  console.log("  - token length:", token?.length)
  console.log("  - backendType:", backendType)

  if (backendType === "phoenix") {
    console.log("[createUnifiedChannelClient] Creating PhoenixChannelClient")
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
