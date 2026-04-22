---
status: accepted
date: 2026-04-19
---

# ADR-0005: STT はローカル `faster-whisper` 中心

## Context

月額 $10 以内 + NDA 配慮 + 5〜15 秒遅延許容。

## Options

1. OpenAI Whisper API（$0.006/min ≒ $0.36/hr）
2. Groq whisper-large-v3-turbo（$0.04/hr）
3. `faster-whisper` ローカル（ゼロコスト）
4. `whisper.cpp` ローカル

## Decision

**3. faster-whisper（large-v3）ローカル実行**

## Consequences

- Pros: ゼロコスト、オフライン可、音声データを外部送信しない
- Cons: Apple Silicon でも初回ロードに数秒。CPU/Metal 選定が必要
- Fallback: 遅すぎる場合は Groq API を選択肢として残す
