// AudioWorklet processor: downsample to 16kHz and convert Float32 → Int16 PCM.
// Posts messages containing Int16 PCM chunks of ~200ms each.
// See docs/adr/0004-use-audio-worklet-over-websocket.md and docs/ws-schema.json.

class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.targetSampleRate = 16000
    this.ratio = sampleRate / this.targetSampleRate
    this.chunkSamples = (this.targetSampleRate * 200) / 1000
    this.buffer = []
    this.cursor = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0) return true
    const channel = input[0]
    if (!channel) return true

    while (this.cursor < channel.length) {
      const floor = Math.floor(this.cursor)
      const ceil = Math.min(floor + 1, channel.length - 1)
      const frac = this.cursor - floor
      const sample = channel[floor] * (1 - frac) + channel[ceil] * frac
      const clipped = Math.max(-1, Math.min(1, sample))
      this.buffer.push(clipped * 0x7fff)
      this.cursor += this.ratio

      if (this.buffer.length >= this.chunkSamples) {
        const pcm = new Int16Array(this.buffer.splice(0, this.chunkSamples))
        this.port.postMessage(pcm.buffer, [pcm.buffer])
      }
    }
    this.cursor -= channel.length
    return true
  }
}

registerProcessor('pcm-processor', PcmProcessor)
