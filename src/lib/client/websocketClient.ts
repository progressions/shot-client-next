/**
 * WebSocket Client - Unified support for ActionCable and Phoenix Channels
 *
 * This module provides backward-compatible ActionCable Consumer interface
 * while supporting both Rails (ActionCable) and Elixir (Phoenix Channels) backends.
 */

import { createConsumer, Consumer } from "@rails/actioncable"
import {
  createUnifiedChannelClient,
  detectBackendType,
  UnifiedChannelClient,
} from "./unifiedChannelClient"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
}

/**
 * Adapter that makes UnifiedChannelClient look like ActionCable Consumer
 * for backward compatibility with existing code
 */
class ConsumerAdapter {
  private unifiedClient: UnifiedChannelClient
  subscriptions: {
    create: (
      params: Record<string, unknown> & { channel: string },
      callbacks: {
        connected?: () => void
        disconnected?: () => void
        received: (data: unknown) => void
      }
    ) => { disconnect: () => void; unsubscribe: () => void }
  }

  constructor(unifiedClient: UnifiedChannelClient) {
    this.unifiedClient = unifiedClient
    this.subscriptions = {
      create: (
        params: Record<string, unknown> & { channel: string },
        callbacks: {
          connected?: () => void
          disconnected?: () => void
          received: (data: unknown) => void
        }
      ) => {
        const { channel, ...rest } = params
        const subscription = this.unifiedClient.subscribe(
          channel,
          rest,
          callbacks
        )
        // Return object with both disconnect() and unsubscribe() for ActionCable compatibility
        return {
          disconnect: () => subscription.disconnect(),
          unsubscribe: () => subscription.disconnect(),
        }
      },
    }
  }

  disconnect() {
    this.unifiedClient.disconnect()
  }
}

/**
 * Creates a consumer that works with either Rails or Phoenix backend
 */
export function consumer({
  jwt,
  api,
}: ClientDependencies): Consumer | ConsumerAdapter {
  // Don't create consumer without a JWT - prevents failed connection loops
  if (!jwt) {
    return {
      subscriptions: {
        create: () => ({
          unsubscribe: () => {},
        }),
      },
      disconnect: () => {},
    }
  }

  const backendType = detectBackendType()

  console.log("[websocketClient] Backend type detected:", backendType)
  console.log(
    "[websocketClient] NEXT_PUBLIC_BACKEND_TYPE:",
    process.env.NEXT_PUBLIC_BACKEND_TYPE
  )
  console.log(
    "[websocketClient] NEXT_PUBLIC_WEBSOCKET_URL:",
    process.env.NEXT_PUBLIC_WEBSOCKET_URL
  )

  if (backendType === "phoenix") {
    // Use unified client with Phoenix Channels
    const baseUrl =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      ""
    const normalizedBaseUrl = baseUrl
      .trim()
      .replace(/^http(s?):\/\//, "ws$1://")
      .replace(/\/socket\/?$/, "")
    const websocketBaseUrl =
      normalizedBaseUrl && !/^wss?:\/\//.test(normalizedBaseUrl)
        ? `ws://${normalizedBaseUrl}`
        : normalizedBaseUrl
    const phoenixUrl = websocketBaseUrl
      ? `${websocketBaseUrl}/socket`
      : "ws://localhost:4002/socket"

    const unifiedClient = createUnifiedChannelClient(phoenixUrl, jwt, "phoenix")
    return new ConsumerAdapter(unifiedClient)
  }

  // Use native ActionCable for Rails backend
  const websocketUrl = api.cable(jwt)
  return createConsumer(websocketUrl)
}
