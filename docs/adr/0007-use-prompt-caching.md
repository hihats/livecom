---
status: accepted
date: 2026-04-19
---

# ADR-0007: プロンプトキャッシングを標準採用

## Context

アブストラクト・スライド抜粋・累積 glossary は毎回共通して長い。

## Decision

Anthropic の `cache_control: {"type": "ephemeral"}` を使い、共通プレフィックスを 5 分 TTL でキャッシュ。

## Consequences

- キャッシュヒット入力は通常の 10% 価格。コスト効果が大きい
- 5 分無通信でキャッシュ失効するため、LLM 呼び出し間隔をこの TTL 内に収めるオーケストレーションが必要
