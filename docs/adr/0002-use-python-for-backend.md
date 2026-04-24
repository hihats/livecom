---
status: accepted
date: 2026-04-19
---

# ADR-0002: バックエンド言語は Python

## Context

STT（whisper）、VAD、PDF 抽出、Anthropic SDK を扱う。

## Options

1. Python
2. Node.js / TypeScript
3. Rust
4. Go

## Decision

**1. Python**

## Consequences

- Pros: `faster-whisper` / `silero-vad` / `pypdf` / Anthropic Python SDK が最も成熟。プロンプトキャッシュ対応も公式で追従が早い
- Cons: フロントエンドと言語が分かれるため共有コード無し。デプロイ時の依存が大きめ
