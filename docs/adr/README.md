# Architecture Decision Records (ADR)

本プロジェクトのアーキテクチャ判断を 1 決定 = 1 ファイルで管理する。記録形式の根拠は [ADR-0013](./0013-use-per-file-adr-layout.md)。

## 文書の住み分け

| 文書 | 役割 | 時間軸 |
| --- | --- | --- |
| [requirements.md](../requirements.md) | 何を作るか（目的・スコープ・制約） | 可変 |
| [ADR (このディレクトリ)](./README.md) | なぜそう選んだか（決定の根拠・代替案・トレードオフ） | 不変（supersede で置換） |
| [design.md](../design.md) | 現在の構造は何か（モジュール・スキーマ・プロトコル） | 可変（常に最新） |

書き分けルール:

- 決定の経緯（なぜ？代替は？）を含む → **ADR** に書く。結果だけ design.md にも反映
- 構造の記述だけ（SQL スキーマ、WebSocket メッセージ形、API 署名、ファイル構成など） → **design.md のみ**
- 不採用にした代替案・過去の supersede された決定 → **ADR のみ**

## Accepted

| ID | タイトル | 日付 |
| --- | --- | --- |
| [0001](./0001-use-local-webapp-delivery.md) | デリバリ形態はローカル Web アプリ | 2026-04-19 |
| [0002](./0002-use-python-for-backend.md) | バックエンド言語は Python | 2026-04-19 |
| [0003](./0003-use-vue-for-frontend.md) | フロントエンドは Vue 3 + Vite + Pinia | 2026-04-19 |
| [0004](./0004-use-audio-worklet-over-websocket.md) | 音声取得は AudioWorklet + WebSocket | 2026-04-19 |
| [0005](./0005-use-faster-whisper-locally.md) | STT はローカル faster-whisper 中心 | 2026-04-19 |
| [0006](./0006-use-claude-haiku-for-llm.md) | 翻訳・解説 LLM は Claude Haiku 4.5 | 2026-04-19 |
| [0007](./0007-use-prompt-caching.md) | プロンプトキャッシングを標準採用 | 2026-04-19 |
| [0008](./0008-batch-llm-calls-per-sentence.md) | LLM 呼び出しはセンテンス単位バッチ | 2026-04-19 |
| [0009](./0009-use-websocket-single-transport.md) | トランスポートは WebSocket 単一 | 2026-04-19 |
| [0010](./0010-persist-with-sqlite-and-markdown.md) | 永続化は SQLite + Markdown エクスポート | 2026-04-19 |
| [0011](./0011-exclude-screen-ocr.md) | 画面/スライド OCR は扱わない | 2026-04-19 |
| [0012](./0012-adopt-openapi-and-websocket-schema.md) | OpenAPI + JSON Schema を採用 | 2026-04-20 |
| [0013](./0013-use-per-file-adr-layout.md) | ADR は per-file レイアウトで管理 | 2026-04-20 |
| [0014](./0014-docker-with-whisper-service-split.md) | Docker 採用と Whisper サービスのホスト分離 | 2026-04-20 |
| [0015](./0015-development-tooling-stack.md) | 開発ツールスタック（uv, ruff, pnpm, ESLint, pytest, vitest 等） | 2026-04-20 |
| [0016](./0016-dev-environment-topology.md) | 開発環境トポロジ（base image, frontend dev on host） | 2026-04-20 |
| [0017](./0017-whisper-model-and-stt-transport.md) | Whisper モデル配置と STT 通信形式 | 2026-04-20 |

## Proposed / Open

実装時のベンチ・比較を経て確定する項目。確定時に個別 ADR 化する。

- **OP-1**: Background ノートに Sonnet を使うか Haiku のみか → M5 時点で A/B し、日本語品質の差と費用差で決定
- **OP-2**: faster-whisper のバックエンド（CTranslate2 Metal vs MLX 版 whisper）→ M2 でレイテンシと精度をベンチ
- **OP-3**: コスト警告の閾値と表現 → 月 $10 の 80% で UI 通知

## Status values

- `accepted` — 採用確定、実装方針として有効
- `proposed` — 検討中（実装時のベンチ/比較待ち）
- `rejected` — 検討したが不採用
- `deprecated` — 採用していたが非推奨化
- `superseded by ADR-NNNN` — より新しい ADR により置き換え

ADR 本文は不変（immutability）。方針変更時は新 ADR を起こし、旧 ADR は `status` のみ書き換える。
