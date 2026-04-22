export type WsClientOptions = {
  url: string
  onMessage?: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
}

export class WsClient {
  private ws: WebSocket | null = null

  constructor(private readonly opts: WsClientOptions) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.opts.url)
      ws.onopen = () => {
        this.opts.onOpen?.()
        resolve()
      }
      ws.onerror = (ev) => {
        this.opts.onError?.(ev)
        reject(ev)
      }
      ws.onclose = () => this.opts.onClose?.()
      ws.onmessage = (ev) => {
        try {
          this.opts.onMessage?.(JSON.parse(ev.data))
        } catch (e) {
          console.warn('ws parse error', e)
        }
      }
      this.ws = ws
    })
  }

  send(msg: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  close(): void {
    this.ws?.close()
    this.ws = null
  }
}
