export type PcmChunkHandler = (pcm: ArrayBuffer) => void

export class AudioCapture {
  private context: AudioContext | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private workletNode: AudioWorkletNode | null = null
  private stream: MediaStream | null = null

  constructor(private readonly onChunk: PcmChunkHandler) {}

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.context = new AudioContext()
    await this.context.audioWorklet.addModule('/pcm-processor.js')
    this.source = this.context.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.context, 'pcm-processor')
    this.workletNode.port.onmessage = (ev) =>
      this.onChunk(ev.data as ArrayBuffer)
    const silentGain = this.context.createGain()
    silentGain.gain.value = 0
    this.source.connect(this.workletNode)
    this.workletNode.connect(silentGain)
    silentGain.connect(this.context.destination)
  }

  async stop(): Promise<void> {
    this.workletNode?.disconnect()
    this.source?.disconnect()
    this.stream?.getTracks().forEach((t) => t.stop())
    await this.context?.close()
    this.context = null
    this.source = null
    this.workletNode = null
    this.stream = null
  }
}

export function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
