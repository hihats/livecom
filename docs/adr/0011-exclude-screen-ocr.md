---
status: accepted
date: 2026-04-19
---

# ADR-0011: 画面/スライド OCR は扱わない

## Context

要件で「画面は見ない（音声のみ）」と確定済み。

## Decision

ライブ画面キャプチャと OCR パイプラインは作らない。

## Consequences

- スコープが縮み、macOS の画面収録権限も不要
- 事前スライド PDF のテキスト抽出は別経路（`pre_context/loader.py`）で扱う
