---
status: accepted
date: 2026-04-20
---

# ADR-0017: Whisper モデル配置と STT 通信形式

## Context

[ADR-0014](./0014-docker-with-whisper-service-split.md) で whisper-service をホストプロセスとして分離した。モデルファイル（large-v3 で約 3GB）の配置と、backend ↔ whisper-service の通信形式を確定する。

## Decision

**モデル配置**: faster-whisper デフォルトの `~/.cache/huggingface/hub/` に置く

- 起動時にモデルが未ダウンロードなら Hugging Face から自動 DL
- 他の Hugging Face 系ツール（transformers 等）とキャッシュを共有できる
- 専用ダウンロードスクリプトや初期化コマンドは不要

**通信形式**: 同期 HTTP

- backend が VAD で切り出した 5〜10 秒の PCM（16kHz Int16 mono の未圧縮音声データ）を `POST /transcribe` に送信
- リクエストボディは `application/octet-stream` の binary
- whisper-service は完全な transcription を JSON で返す（部分結果なし）
- 要件の 5〜15 秒遅延目標の範囲内で収まる

## Consequences

- 初回起動時に数分のモデル DL が発生（回線依存）。README に明記する
- 部分結果（話している途中の途中経過テキスト）は出せない。要件としては問題なし
- streaming 化が必要になった場合は本 ADR を supersede する新 ADR を起こす

## Options（不採用）

- 固定パス（`~/.livecom/models/`）: 他ツールとの二重管理リスク、デフォルトで十分
- Git LFS でリポジトリ同梱: リポジトリ肥大化・LFS 料金枠消費、個人ツールには過剰
- ストリーミング HTTP（chunked）: 部分結果提供のラッパ実装コスト。要件遅延目標上は不要
- WebSocket（双方向）: 状態管理と接続寿命管理が複雑、オーバースペック

## References

- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Hugging Face cache: https://huggingface.co/docs/huggingface_hub/guides/manage-cache
