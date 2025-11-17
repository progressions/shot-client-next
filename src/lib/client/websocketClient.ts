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
  subscriptions: any

  constructor(unifiedClient: UnifiedChannelClient) {
    this.unifiedClient = unifiedClient
    this.subscriptions = {
      create: (
        params: any,
        callbacks: {
          connected?: () => void
          disconnected?: () => void
          received: (data: any) => void
        }
      ) => {
        const { channel, ...rest } = params
        return this.unifiedClient.subscribe(channel, rest, callbacks)
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
export function consumer({ jwt, api }: ClientDependencies): Consumer | any {
  // Don't create consumer without a JWT - prevents failed connection loops
  if (!jwt) {
    return {
      subscriptions: {
        create: () => ({
          unsubscribe: () => {}
        })
      },
      disconnect: () => {}
    }
  }

  const backendType = detectBackendType()

  if (backendType === "phoenix") {
    // Use unified client with Phoenix Channels
    const phoenixUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
      ? `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/socket`
      : "ws://localhost:4002/socket"

    const unifiedClient = createUnifiedChannelClient(
      phoenixUrl,
      jwt,
      "phoenix"
    )
    return new ConsumerAdapter(unifiedClient)
  }

  // Use native ActionCable for Rails backend
  const websocketUrl = api.cable(jwt)
  return createConsumer(websocketUrl)
}
