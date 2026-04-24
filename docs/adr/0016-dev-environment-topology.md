---
status: accepted
date: 2026-04-20
---

# ADR-0016: 開発環境トポロジ

## Context

[ADR-0014](./0014-docker-with-whisper-service-split.md) で backend/frontend は Docker、whisper-service はホスト実行と決めた。残る具体レベルの選択として、Docker base image と frontend dev サーバの実行位置を確定する。

## Decision

**Backend / frontend の Docker base image**: `ghcr.io/astral-sh/uv:python3.12-bookworm-slim`（backend 側）

- [ADR-0015](./0015-development-tooling-stack.md) で採用した uv がプリインストール済みで Dockerfile が簡潔
- Debian bookworm base のため ML 関連 C 拡張（onnxruntime 等）の prebuild wheel が揃う
- Alpine は musl libc が原因で prebuild wheel 不足 → 採用せず

**Frontend dev サーバ**: host で直接 `pnpm dev` を動かす（Docker 内で走らせない）

- Vite の HMR（Hot Module Replacement = 編集した瞬間に該当モジュールだけをブラウザが差し替える機能）は Docker Desktop for Mac のファイル共有経由だと不安定・遅い
- prod build 時のみ Docker を使う
- host に Node 20 のインストールが必要（mise / volta / fnm / 直接インストールのいずれか、プロジェクト側では強制しない）

## Consequences

- dev 起動プロセス: host で whisper-service + host で `pnpm dev` + Docker で backend、計 3 系統
- Makefile で `make dev` 一発にラップする
- CI やクリーン環境では `docker compose up` のみで動作確認可能（Metal 無しのため whisper 経路は fallback 確認用）

## Options（不採用）

- Base image: `python:3.12-slim` + uv 手動インストール（Dockerfile が数行増えるだけで差は小さい）
- Base image: `python:3.12-alpine`（onnxruntime 等の wheel 不足で地雷）
- Frontend dev を container 内で実行（HMR 不安定、polling 設定の手間）
- Frontend dev を host/container 両対応（メンテコスト、個人ツールで使わない方が腐る）
