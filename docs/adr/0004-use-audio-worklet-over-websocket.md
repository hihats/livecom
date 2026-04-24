---
status: accepted
date: 2026-04-19
---

# ADR-0004: 音声取得は AudioWorklet + WebSocket の生 PCM 伝送

## Context

マイク音声を低遅延で Python バックエンドに渡したい。

## Options

1. `MediaRecorder` で Opus/WebM 送信 → サーバで ffmpeg デコード
2. `AudioWorklet` で 16kHz Int16 PCM を WebSocket で送信
3. HTTP チャンク POST（multipart streaming）

## Decision

**2. AudioWorklet + WebSocket**

## Consequences

- Pros: デコード不要で faster-whisper に直接流せる。レイテンシ最小。実装もサーバ側が単純
- Cons: 帯域が大きい（16kHz × 16bit = 32kB/s）。ローカル閉じているので問題なし
