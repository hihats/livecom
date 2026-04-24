---
status: accepted
date: 2026-04-19
---

# ADR-0009: トランスポートは WebSocket 単一

## Context

音声アップ + 結果ダウン + Q&A を一本化したい。

## Options

1. WebSocket 双方向
2. 音声は WebSocket、結果は SSE、Q&A は HTTP POST
3. すべて HTTP ロングポーリング

## Decision

**1. WebSocket 単一**

## Consequences

- Pros: プロトコルが 1 種類で済み、個人ツールとして単純
- Cons: プロキシ経路で問題になるが、`localhost` 限定なので影響なし
