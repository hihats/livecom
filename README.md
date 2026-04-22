# livecom

技術カンファレンスの英語講演音声をリアルタイムに日本語へ翻訳し、同時に用語・背景・Q&A 形式の解説を提供するパーソナルツール。

## Features

- ブラウザマイク + 録音/録画ファイル両対応
- 英語 → 日本語（5〜15 秒遅延、精度優先）
- 用語解説 / 背景解説 / Q&A の 3 種を切替可能なパネル UI
- セッション終了時に Markdown エクスポート
- 月額 ~$10 以内に収まる LLM 利用（Claude Haiku + プロンプトキャッシュ）

## Requirements

| 項目 | 要件 |
| --- | --- |
| OS | macOS（Apple Silicon 推奨）/ Linux |
| Python | 3.12+ |
| Node | 20+ |
| Docker | Docker Desktop（backend / frontend 用） |
| API | Anthropic API key |

## Install Tooling

初回セットアップのみ。すでに入っているものはスキップ可能。

**Homebrew で一括:**

```sh
brew install uv node@20 pnpm
```

または個別に:

- **uv**（Python パッケージ管理、host 側で whisper-service / test / lint 実行時に必要）
  - `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - https://docs.astral.sh/uv/
- **Node 20+**
  - Homebrew: `brew install node@20`
  - バージョン管理ツール: [mise](https://mise.jdx.dev/) / [volta](https://volta.sh/) / [fnm](https://github.com/Schniz/fnm) など
- **pnpm**
  - Homebrew: `brew install pnpm`
  - Node 20+ 同梱: `corepack enable`
- **Docker Desktop**
  - https://www.docker.com/products/docker-desktop/
- **Anthropic API key**
  - https://console.anthropic.com/ で発行

## Architecture

backend / frontend は Docker で動作する一方、`whisper-service` は Apple Silicon の Metal アクセラレーションを使うため host プロセスとして分離して起動する。詳細は [ADR-0014](./docs/adr/0014-docker-with-whisper-service-split.md) を参照。

```
[browser] ──WebSocket──> [backend (docker)] ──HTTP──> [whisper-service (host, Metal)]
                             │
                             └─────HTTPS──────────> Anthropic API (Claude Haiku)
```

## Quick Start

### 1. 環境変数

```
cp .env.example .env
# .env を編集して ANTHROPIC_API_KEY を設定
```

### 2. 依存インストール

```
cd backend         && uv sync && cd ..
cd whisper-service && uv sync && cd ..
cd frontend        && pnpm install && cd ..
```

### 3. 起動（3 ターミナル）

```
make whisper    # Terminal 1 (host, :9000)
make frontend   # Terminal 2 (host, :5173)
make backend    # Terminal 3 (docker, :8000)
```

初回起動時に faster-whisper が `large-v3` モデル（~3GB）を `~/.cache/huggingface/hub/` に自動ダウンロードする（ADR-0017）。

### 4. ブラウザを開く

```
open http://localhost:5173
```

## Documentation

| 文書 | 役割 |
| --- | --- |
| [requirements.md](./docs/requirements.md) | 何を作るか |
| [design.md](./docs/design.md) | 現在の構造は何か |
| [adr/README.md](./docs/adr/README.md) | なぜそう選んだか（ADR index） |
| [openapi.yaml](./docs/openapi.yaml) | HTTP API 仕様 |
| [ws-schema.json](./docs/ws-schema.json) | WebSocket メッセージ仕様 |
| [whisper-service-api.yaml](./docs/whisper-service-api.yaml) | whisper-service 内部 API |

## Development

`make help` で利用可能なターゲットを一覧できる。

| ターゲット | 用途 |
| --- | --- |
| `make test` | pytest + vitest |
| `make lint` | ruff + eslint |
| `make format` | ruff format + prettier |
| `make typecheck` | mypy + vue-tsc |

## License

Private / personal use only.
