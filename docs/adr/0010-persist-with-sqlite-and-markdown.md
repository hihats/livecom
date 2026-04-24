---
status: accepted
date: 2026-04-19
---

# ADR-0010: 永続化は SQLite + Markdown エクスポート

## Context

パーソナルツール。外部連携なしでセッションを振り返りたい。

## Options

1. JSON ファイルのみ
2. SQLite + Markdown エクスポート
3. SQLite + Notion API 直送

## Decision

**2. SQLite + Markdown**

## Consequences

- Pros: クエリ性が SQLite で確保できる。Markdown は Notion/Obsidian どちらにも貼れる
- Cons: Notion 直送は将来検討。今は手貼りで十分
