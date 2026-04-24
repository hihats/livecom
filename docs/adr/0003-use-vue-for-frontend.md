---
status: accepted
date: 2026-04-19
---

# ADR-0003: フロントエンドは Vue 3 + Vite + Pinia

## Context

個人開発 + 日本語情報の潤沢さ + WebSocket の高頻度更新。

## Options

1. Svelte 5 + SvelteKit
2. Vue 3 + Vite + Pinia
3. React + Vite + Zustand
4. Vanilla TS（ライブラリ無し）

## Decision

**2. Vue 3 + Vite + Pinia**

## Consequences

- Pros: 日本語情報が多くエコシステム安定。API 安定性が高く情報の新旧混在が少ない。学習コストも React より低い
- Cons: Svelte ほどストア記述が短くはならない。が誤差レベル
