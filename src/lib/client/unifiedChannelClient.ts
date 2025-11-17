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

  constructor(websocketUrl: string, token: string) {
    console.log("[PhoenixChannelClient] Constructor called with:")
    console.log("  - websocketUrl:", websocketUrl)
    console.log("  - token:", token ? `${token.substring(0, 20)}...` : "EMPTY OR UNDEFINED")
    console.log("  - Bearer token:", `Bearer ${token}`)

    this.socket = new Socket(websocketUrl, {
      params: { token: `Bearer ${token}` },
    })
    this.socket.connect()

    console.log("[PhoenixChannelClient] Socket created and connecting...")
  }

  subscribe(
    channelName: string,
    params: Record<string, any>,
    options: ChannelOptions
  ): UnifiedChannel {
    // Convert Rails channel name to Phoenix topic format
    // "CampaignChannel" with {id: "123"} -> "campaign:123"
    const topic = this.convertToPhoenixTopic(channelName, params)

    const channel = this.socket.channel(topic, params)

    // Phoenix uses event-based messages, ActionCable uses single 'received'
    // We listen for common Phoenix events and forward to received callback
    channel.on("update", options.received)
    channel.on("broadcast", options.received)
    channel.on("change", options.received)

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
