# Detailed Design — livecom

作成日: 2026-04-19
関連: [requirements.md](./requirements.md), [adr/README.md](./adr/README.md)
仕様: [openapi.yaml](./openapi.yaml), [ws-schema.json](./ws-schema.json), [whisper-service-api.yaml](./whisper-service-api.yaml)

本書は決定済みアーキテクチャに基づく具体的な構造定義。判断の根拠や代替案は [adr/README.md](./adr/README.md) を参照。API やメッセージの厳密な形状は上記の仕様ファイル群に集約している。

## 1. システム構成図

```
┌── User's Mac (host) ──────────────────────────────────────────────┐
│                                                                   │
│  Browser (localhost:5173)                                         │
│                                                                   │
│  ┌── docker compose ────────────────────────────────┐             │
│  │  [frontend]  Vue 3 + Vite + Pinia                │             │
│  │    AudioWorklet: mic → PCM16 @ 16kHz             │             │
│  │    WebSocket client                              │             │
│  │    Subtitle / Glossary / Q&A panels              │             │
│  │            │ WebSocket (JSON, base64 PCM)        │             │
│  │            ▼                                     │             │
│  │  [backend]   FastAPI, uvicorn :8000              │             │
│  │    VAD (silero)                                  │             │
│  │    STT client ─────HTTP─────┐                    │             │
│  │    Sentence buffer          │                    │             │
│  │    LLM Orchestrator ────────┼──► Anthropic API   │             │
│  │      - Translate + terms    │    (Haiku 4.5)     │             │
│  │      - Background note      │                    │             │
│  │      - Q&A responder        │                    │             │
│  │    Session Store (SQLite)   │                    │             │
│  │    Markdown exporter        │                    │             │
│  └─────────────────────────────┼────────────────────┘             │
│                                │ host.docker.internal:9000        │
│                                ▼                                  │
│  ┌──────────────────────────────────────────┐                     │
│  │ [whisper-service]  host native process   │                     │
│  │   FastAPI :9000                          │                     │
│  │   faster-whisper (Metal / MLX)           │                     │
│  │   POST /transcribe  (PCM bytes → JSON)   │                     │
│  └──────────────────────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────┘
```

## 2. モジュール分割

### Backend (`backend/app/`)

| モジュール | 責務 |
| --- | --- |
| `api/session.py` | セッション作成/終了、プリコンテキスト登録 (POST) |
| `api/audio_ws.py` | マイク PCM を受けるストリーミング WebSocket |
| `api/file_ingest.py` | 録音ファイルアップロード → バッチ処理キック |
| `api/qa.py` | Q&A リクエスト (WebSocket or POST) |
| `api/export.py` | Markdown 取得 |
| `audio/vad.py` | Silero-VAD で発話区間を切り出し |
| `stt_client/client.py` | whisper-service への HTTP クライアント。同期リクエスト + リトライ |
| `llm/client.py` | Anthropic SDK 薄いラッパ。プロンプトキャッシュ設定込み |
| `llm/prompts.py` | プロンプトテンプレート（翻訳・背景・Q&A） |
| `llm/commentary.py` | センテンスバッファ → LLM 呼び出しのオーケストレーション |
| `session/state.py` | セッション中のインメモリ状態（glossary, rolling context 等） |
| `session/store.py` | SQLite DAL |
| `pre_context/loader.py` | アブストラクト/スライド PDF → 用語事前抽出 |
| `export/markdown.py` | セッション → Markdown 書き出し |

### Frontend (`frontend/src/`)

| ファイル | 責務 |
| --- | --- |
| `lib/audioCapture.ts` | AudioWorklet で 16kHz PCM を取得し 200ms 毎に送信 |
| `lib/wsClient.ts` | 再接続・シーケンス管理付き WebSocket クライアント |
| `stores/session.ts` | セッションステート（Pinia store） |
| `App.vue` | メインレイアウト |
| `components/SubtitleTrack.vue` | 英 + 日の 2 行字幕 |
| `components/GlossaryPanel.vue` | 用語・背景・Q&A のタブ切替 |
| `components/QAInput.vue` | テキスト質問 + サジェストボタン |
| `components/SessionControls.vue` | 開始/停止/エクスポート |
| `components/PreContextForm.vue` | アブストラクト入力、スライド PDF ドロップ |

### Whisper Service (`whisper-service/app/`)

host プロセスとして動作（Docker 外）。Metal アクセラレーション利用のため独立させる（[ADR-0014](./adr/0014-docker-with-whisper-service-split.md)）。

| ファイル | 責務 |
| --- | --- |
| `main.py` | FastAPI エンドポイント `POST /transcribe`（PCM バイナリ → JSON） |
| `engine.py` | faster-whisper ラッパ（large-v3、Metal / MLX 経路） |

## 3. データモデル (SQLite)

```sql
CREATE TABLE session (
  id           TEXT PRIMARY KEY,
  title        TEXT,
  abstract     TEXT,
  speaker_bio  TEXT,
  slide_text   TEXT,          -- PDF 抽出結果
  started_at   INTEGER,
  ended_at     INTEGER
);

CREATE TABLE sentence (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  seq         INTEGER NOT NULL,
  ts_start_ms INTEGER,
  ts_end_ms   INTEGER,
  text_en     TEXT,
  text_ja     TEXT
);

CREATE TABLE glossary (
  session_id  TEXT NOT NULL,
  term        TEXT NOT NULL,
  definition  TEXT,
  first_seen_sentence INTEGER,
  PRIMARY KEY (session_id, term)
);

CREATE TABLE commentary (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  kind        TEXT,            -- 'background' | 'qa'
  question    TEXT,
  body        TEXT,
  related_sentence_ids TEXT,   -- JSON array
  created_at  INTEGER
);

CREATE TABLE cost_ledger (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  model       TEXT,
  input_tok   INTEGER,
  cached_tok  INTEGER,
  output_tok  INTEGER,
  usd         REAL,
  created_at  INTEGER
);
```

## 4. 音声パイプライン

### マイク経路（リアルタイム）

1. フロントエンド: AudioWorklet で 16kHz/mono/Float32 → Int16 PCM に変換
2. 200ms ごとに `{type: "audio_chunk", seq, pcm_b64}` で送信
3. バックエンド: Silero-VAD にかけ、発話区間を 5〜10 秒単位でまとめる
4. 発話区間確定で whisper-service (`POST /transcribe`) に HTTP 送信 → センテンスに分割
5. 新規センテンスは `sentence` テーブル + インメモリ `sentence buffer` に enqueue
6. LLM オーケストレータが 1〜3 センテンスずつ取り出し処理

### ファイル経路（バッチ）

1. `POST /session/{id}/ingest-file` で multipart upload
2. `ffmpeg` で 16kHz mono WAV に正規化
3. whisper-service に一括送信し書き起こし（長尺はサービス内部でバッチ処理）
4. センテンス列を同じパイプラインに流し込む（LLM 処理は並列実行、セマフォで上限）

## 5. LLM オーケストレーション

### ルート

| ルート | 頻度 | モデル | 目的 |
| --- | --- | --- | --- |
| Translate + terms | 新規 1〜3 センテンス毎 | Haiku 4.5 | 翻訳 + 新規用語抽出 |
| Background note | 30 秒毎 or 用語密度が閾値超 | Haiku 4.5（必要時 Sonnet） | 段落の背景・関連文脈 |
| Q&A | ユーザ入力時 | Haiku 4.5 | ユーザ質問への回答 |

並列度は asyncio セマフォで 3 に制限。キャッシュ TTL 5 分に合わせ、セッション中は最低 1 回/4 分のダミーコールを入れない設計（自然なセンテンス到来でヒットし続ける想定）。

### プロンプトキャッシュ構成

`cache_control: {"type": "ephemeral"}` を付与するブロック:

- システムプロンプト（固定）
- `<abstract>` / `<speaker>` / `<slides>` / `<known_terms>` を含む共通プレフィックス

インクリメンタル部分（`<recent_context>` `<current>`）はキャッシュ対象外。

### 翻訳プロンプト（概形）

```
system: You are a simultaneous interpreter and tech commentator for English conference talks.
        Output STRICT JSON:
        {
          "translation_ja": "...",
          "new_terms": [ {"term": "...", "definition_ja": "..."} ]
        }
        Only include technical terms NOT already in known_terms. ≤1 line definitions.

user (cached):
  <abstract>{abstract}</abstract>
  <speaker>{speaker_bio}</speaker>
  <slides>{slide_excerpt}</slides>
  <known_terms>{glossary_json}</known_terms>

user (fresh):
  <recent_context>{previous 3 sentences}</recent_context>
  <current>{1〜3 new sentences}</current>
```

### コンテキストウィンドウ管理

- LLM に渡す transcript は直近 5 分のみ（セッション全体は渡さない）
- glossary は累積。項目数が 100 超えたら LRU で圧縮
- 累積コストを `cost_ledger` に記録

## 6. WebSocket プロトコル

メッセージの厳密な形状は [`ws-schema.json`](./ws-schema.json) に集約（JSON Schema Draft 2020-12、`type` フィールドによる discriminated union）。本節ではエンドポイントと概要のみ扱う。

- エンドポイント: `GET /sessions/{session_id}/ws`（HTTP から Upgrade）
- Client → Server: `hello`, `audio_chunk`, `qa_request`, `bye`
- Server → Client: `partial_transcript`, `committed_sentence`, `glossary_update`, `background_note`, `qa_response`, `cost_update`, `error`
- バイナリフレームは使わず、PCM は base64 埋め込み JSON で統一

## 7. 事前コンテキスト投入

- アブストラクト: テキスト入力（必須）
- スライド PDF: ドロップ → `pypdf` でテキスト抽出、全文を `slide_text` に格納
- 初期 glossary ウォームアップ: アブストラクト + スライドを LLM に 1 回投げ、20〜50 個の候補用語を事前生成 → `glossary` テーブルに insert

## 8. Markdown エクスポート仕様

`POST /session/{id}/export` → ダウンロード

```markdown
# {title}

**Speaker:** {speaker}
**Date:** {YYYY-MM-DD}

## Abstract
{abstract}

## Transcript (EN → JA)

> [00:23] We built a new scheduler...
> [00:23] 新しいスケジューラを構築しました...

> ...

## Glossary
- **etcd** — 分散 KV ストア。Kubernetes の状態保持に使用。
- ...

## Background notes
- [05:12] この話題は KEP-2876 に紐づく...

## Q&A
- Q: このRFCは？
  A: RFC 9110 の文脈で...
```

## 9. エラーハンドリング

| 箇所 | 戦略 |
| --- | --- |
| WebSocket 切断 | クライアントで指数バックオフ再接続。seq でロスト検出、直近 3 秒分は再送 |
| Whisper 失敗 | 当該チャンクをスキップし UI に warning を表示、セッションは続行 |
| Anthropic API 失敗 | 3 回まで指数バックオフ、それでも失敗なら当該センテンスを未訳のまま DB に残し、後で再処理可能にマーク |
| コスト超過 | セッション開始時に月間累計を読み、閾値超なら開始確認ダイアログ |

## 10. ランタイム要件

- macOS / Linux (Windows は後回し)
- Python 3.12+
- Node 20+
- Apple Silicon 推奨（whisper-service の Metal/MLX 経路）
- Docker Desktop（backend/frontend 用）
- 環境変数 `ANTHROPIC_API_KEY`

### プロセス構成

- host: `whisper-service`（`uv run` 等で常駐、`:9000`）
- container: `backend`（`:8000`）、`frontend`（`:5173`）、`docker compose up` で起動
- backend → whisper-service: `host.docker.internal:9000`（Linux は compose の `extra_hosts` で解決）

## 11. 実装マイルストーン

| M | 目標 | 確認方法 |
| --- | --- | --- |
| M1 | FastAPI + WebSocket + ブラウザマイク → バックエンドでバイト数ログ | `print(len(chunk))` が流れる |
| M2 | whisper-service 起動 + backend から HTTP 呼び出し、英語字幕のみ UI に表示 | 英語録音ファイルで書き起こしが出る |
| M3 | Haiku で翻訳、二言語字幕 | 日本語が隣に出る |
| M4 | 用語抽出 + Glossary パネル + 重複排除 | 新規用語のみパネルに追加される |
| M5 | Background ノート + Q&A | 30 秒毎の注釈と質問応答が動く |
| M6 | ファイルアップロード経路 | mp4 投入で全文処理完了 |
| M7 | Markdown エクスポート | ダウンロードした md が Notion に貼れる |
| M8 | プリコンテキスト（アブストラクト + PDF） | 冒頭から用語解説が出る |
| M9 | プロンプトキャッシュ最適化、コストトラッカー | 1 時間 $1 未満を達成 |
