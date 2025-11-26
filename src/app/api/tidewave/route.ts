import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    const { tidewaveHandler } = await import("tidewave/next-js/handler")
    const handler = await tidewaveHandler()

    // Convert App Router request to Pages API format
    const body = await req.text()

    return new Promise<NextResponse>(resolve => {
      const mockRes = {
        statusCode: 200,
        headers: new Headers(),
        body: "",
        status(code: number) {
          this.statusCode = code
          return this
        },
        setHeader(name: string, value: string) {
          this.headers.set(name, value)
          return this
        },
        end(data?: string) {
          this.body = data || ""
          resolve(
            new NextResponse(this.body, {
              status: this.statusCode,
              headers: this.headers,
            })
          )
        },
        json(data: unknown) {
          this.headers.set("Content-Type", "application/json")
          this.body = JSON.stringify(data)
          resolve(
            new NextResponse(this.body, {
              status: this.statusCode,
              headers: this.headers,
            })
          )
        },
      }

      const mockReq = {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        body: body ? JSON.parse(body) : undefined,
      }

      handler(mockReq as never, mockRes as never)
    })
  } else {
    return new NextResponse(null, { status: 404 })
  }
}

export async function GET() {
  return new NextResponse(null, { status: 404 })
}
