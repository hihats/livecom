---
status: accepted
date: 2026-04-20
---

# ADR-0014: Docker 採用と Whisper サービスのホスト分離

## Context

開発・配布環境を Docker で再現性を持たせたい。一方で faster-whisper は Apple Silicon の Metal アクセラレーション（CTranslate2 Metal / MLX 経路）で large-v3 を 3〜5x realtime で動かせるが、Docker Desktop for Mac は GPU/Metal を container に公開しない。Docker 内で CPU フォールバックすると large-v3 は 0.5x realtime まで落ち、要件の 5〜15 秒遅延を維持できなくなる（[ADR-0005](./0005-use-faster-whisper-locally.md)）。

Metal を必要とするのは faster-whisper 1 コンポーネントのみ。他（FastAPI, Silero-VAD, LLM Orchestrator, SQLite）は CPU/IO バウンドで Docker 内でも問題なく動く。

## Options

| ID | 概要 | Metal | 複雑度 |
| --- | --- | --- | --- |
| A | 全部 Docker | 不可 | 低 |
| B | 全部ネイティブ | 可 | 低 |
| C | dev はネイティブ、CI/配布は Docker | 可（dev のみ） | 中 |
| D | Dual-mode（ネイティブ / Docker 切替） | 条件付き | 中〜高 |
| E | Docker + Groq API フォールバック | 不要化 | 中 |
| F | Whisper だけ host プロセス、他は Docker | 可 | 中 |
| G | Whisper を独立 HTTP/gRPC マイクロサービスに切り出す | 可 | 中〜高 |

## Decision

**G. Whisper を独立 HTTP サービスとして host 側で実行**

- `backend/` / `frontend/` は Docker で起動（`docker compose up`）
- `whisper-service/` は host でネイティブ実行（`uv run` 等、Metal 使用）
- 通信: HTTP、リクエストボディに PCM バイナリ（`application/octet-stream`）、レスポンスは JSON
- Docker → host 到達: `host.docker.internal:9000`（Linux 互換のため compose に `extra_hosts: ["host.docker.internal:host-gateway"]` を追加）
- gRPC は不採用。proto 管理・codegen のコストが個人ツール規模で ROI に見合わない

## Consequences

- Pros
  - Metal を使って faster-whisper がフル性能で動く
  - Docker 再現性を backend/frontend に残せる（Linux/CI でも動作確認可能）
  - Whisper サービスの将来差替・リモート化（GPU サーバへ送る）が容易
  - Whisper プロセスのクラッシュが backend を巻き込まない
- Cons
  - 起動手順が 2 系統（host の whisper-service + `docker compose up`）。Makefile で吸収
  - HTTP ラウンドトリップのオーバーヘッド（localhost のため無視できる水準）
  - whisper-service の内部 API を別途定義する必要（`docs/whisper-service-api.yaml`）

## References

- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Docker Desktop GPU support (macOS は現時点で非対応): https://docs.docker.com/desktop/features/gpu/
