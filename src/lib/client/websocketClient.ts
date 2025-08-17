import { createConsumer, Consumer } from "@rails/actioncable"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
}

export function consumer({ jwt, api }: ClientDependencies): Consumer {
  const websocketUrl = api.cable(jwt)
  return createConsumer(websocketUrl)
}
