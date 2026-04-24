---
status: accepted
date: 2026-04-19
---

# ADR-0001: デリバリ形態はローカル Web アプリ

## Context

要件はマルチプラットフォーム・パーソナル用途・マイクと録音ファイルの両方。NDA 配慮のためローカル完結が望ましい。

## Options

1. ネイティブ macOS アプリ（Swift）
2. Electron / Tauri デスクトップアプリ
3. ローカル FastAPI + ブラウザ SPA（`localhost` 配信）
4. 純ブラウザ SPA + クラウドバックエンド

## Decision

**3. ローカル FastAPI + ブラウザ SPA**

## Consequences

- Pros: OS 権限不要（`getUserMedia` でマイク）。Mac/Linux/Win 共通。配布はローカル実行で済む
- Cons: ブラウザ経由なのでシステム音声キャプチャは不可（要件外なので許容）。常駐サーバを起動する手間がある
