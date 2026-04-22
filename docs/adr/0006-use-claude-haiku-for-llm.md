---
status: accepted
date: 2026-04-19
---

# ADR-0006: 翻訳・解説 LLM は Anthropic Claude Haiku 4.5

## Context

月額 $10 以内に 10 時間/月の処理を収めたい。日本語品質も要る。

## Options

1. Claude Haiku 4.5
2. Claude Sonnet 4.6
3. Gemini 2.5 Flash
4. GPT-5 mini

## Decision

**1. Haiku 4.5 を主経路、必要時のみ Sonnet**

## Consequences

- 試算: 1 時間の講演で入力 ~150 回 × 3k token、出力 300 token/回 → 入力 $0.45 + 出力 $0.23 ≒ **$0.68/hr**。プロンプトキャッシュ有効で **$0.15/hr 台**まで下がる見込み
- 10 時間/月なら $1.5〜7 程度で予算内
- Sonnet は背景解説の深掘り時に限定的に呼ぶ（A/B 比較で判断）
