# CLAUDE.md — livecom

AI アシスタント向けの作業指針。人間向けの詳細は [README.md](./README.md)。

## プロジェクト概要

技術カンファレンスの英語音声を日本語に同時翻訳し、用語・背景・Q&A 解説を提供するパーソナル Web アプリ。

## 文書マップ（作業前に必ず確認）

| 文書 | 役割 | 時間軸 |
| --- | --- | --- |
| [docs/requirements.md](./docs/requirements.md) | 何を作るか（要件・制約） | 可変 |
| [docs/adr/](./docs/adr/) | なぜそう選んだか（決定の根拠） | 不変 |
| [docs/design.md](./docs/design.md) | 現在の構造（モジュール・パイプライン） | 可変 |
| [docs/openapi.yaml](./docs/openapi.yaml) | HTTP API 仕様（SSoT） | 可変 |
| [docs/ws-schema.json](./docs/ws-schema.json) | WebSocket メッセージ仕様（SSoT） | 可変 |
| [docs/whisper-service-api.yaml](./docs/whisper-service-api.yaml) | whisper-service 内部 API 仕様 | 可変 |

住み分けルール: [docs/adr/README.md](./docs/adr/README.md) 冒頭を参照。

## ディレクトリ構成

```
backend/         # FastAPI, Docker 内で動作 (:8000)
frontend/        # Vue 3 + Vite + Pinia, 開発は host 直接 (:5173)
whisper-service/ # FastAPI + faster-whisper, host 常駐 (:9000, Metal 必須)
docs/            # 仕様・設計・ADR
```

## 決定済みの技術スタック（ADR 0015 / 0016）

- Python: **uv** + **ruff** + **mypy** + **pytest**
- TypeScript/Vue: **pnpm** + **ESLint + Prettier** + **vue-tsc** + **vitest**
- Docker base: `ghcr.io/astral-sh/uv:python3.12-bookworm-slim`
- タスクランナ: **Makefile**

## 重要な制約

- whisper-service は host 実行（Docker 内では Metal GPU が使えないため）
- backend → whisper-service は `http://host.docker.internal:9000`
- プロンプトキャッシュは 5 分 TTL、月額 $10 枠内に収めるため必須
- 要件の遅延目標: 5〜15 秒（これを超える設計は避ける）
- 画面キャプチャ / OCR は対象外（ADR-0011）

## コーディング方針（user's global CLAUDE.md より）

- **コード**: How を書く（What は識別子で表現）
- **テスト**: What を書く
- **コミット**: Why を書く
- **コメント**: Why not を書く（自己説明的なら書かない）

## 変更を加えるときの原則

1. 既存 ADR と矛盾する変更は新しい ADR を起案してから実装（ADR-0013 の不変性原則）
2. API / メッセージ形状を変える場合は SSoT（openapi.yaml / ws-schema.json / whisper-service-api.yaml）を先に更新
3. design.md は常に現在の構造を反映（実装と乖離したら更新）
