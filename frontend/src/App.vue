<script setup lang="ts">
import { ref } from 'vue'
import { WsClient } from './lib/wsClient'
import { AudioCapture, arrayBufferToBase64 } from './lib/audioCapture'

const recording = ref(false)
const status = ref<'idle' | 'connecting' | 'recording' | 'error'>('idle')
const lastSeq = ref(0)
const bytesSent = ref(0)
const errorMsg = ref('')

let ws: WsClient | null = null
let capture: AudioCapture | null = null

async function handleDisconnect(errorState = false) {
  recording.value = false
  if (errorState) {
    status.value = 'error'
  } else if (status.value !== 'idle') {
    status.value = 'idle'
  }
  await capture?.stop()
  capture = null
  ws = null
}

async function start() {
  if (recording.value) return
  status.value = 'connecting'
  errorMsg.value = ''
  const sessionId = crypto.randomUUID()

  try {
    ws = new WsClient({
      url: `ws://${location.host}/sessions/${sessionId}/ws`,
      onOpen: () => {
        status.value = 'recording'
        ws?.send({ type: 'hello', session_id: sessionId })
      },
      onClose: () => {
        void handleDisconnect()
      },
      onError: (ev) => {
        console.error('ws error', ev)
        void handleDisconnect(true)
      },
    })
    await ws.connect()

    capture = new AudioCapture((pcm) => {
      lastSeq.value += 1
      bytesSent.value += pcm.byteLength
      ws?.send({
        type: 'audio_chunk',
        seq: lastSeq.value,
        pcm_b64: arrayBufferToBase64(pcm),
      })
    })
    await capture.start()
    recording.value = true
  } catch (e) {
    status.value = 'error'
    errorMsg.value = e instanceof Error ? e.message : String(e)
    await cleanup()
  }
}

async function stop() {
  if (!recording.value) return
  await capture?.stop()
  ws?.send({ type: 'bye' })
  await cleanup()
  recording.value = false
  status.value = 'idle'
}

async function cleanup() {
  ws?.close()
  capture = null
  ws = null
}
</script>

<template>
  <main>
    <h1>livecom</h1>
    <p>
      Status: <strong>{{ status }}</strong>
    </p>
    <p v-if="errorMsg" class="error">Error: {{ errorMsg }}</p>
    <p v-if="recording || lastSeq > 0">
      Seq: {{ lastSeq }} / Bytes sent: {{ bytesSent }}
    </p>
    <button v-if="!recording" @click="start">Start</button>
    <button v-else @click="stop">Stop</button>
  </main>
</template>

<style scoped>
main {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, -apple-system, sans-serif;
}
button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}
.error {
  color: #c00;
}
</style>
