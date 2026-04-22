---
status: accepted
date: 2026-04-20
---

# ADR-0012: インターフェース仕様として OpenAPI + JSON Schema を採用

## Context

API 仕様の記述をどう残すかが曖昧だった。当初「個人ツールで FastAPI 自動生成があるなら手書き OpenAPI は ROI が低い」と判断していたが、以下の再検討を経て方針を変えた:

- 「将来の自分」も仕様書の利用者である（6 ヶ月後に interface を単一ファイルで確認したい）
- 設計段階で手書きすると実装前に interface 形状を固定する強制力が働く
- AI コーディング時にプロンプトに渡す仕様根拠として機能する
- WebSocket は FastAPI 自動生成の対象外のため、手書き仕様が必要不可欠

## Options

1. FastAPI 自動生成のみ（手書き spec なし）
2. OpenAPI のみ手書き（WebSocket は design.md の散文のまま）
3. OpenAPI (HTTP) + JSON Schema (WebSocket) の両方を手書き
4. AsyncAPI で WebSocket を含め全部記述

## Decision

**3. OpenAPI + JSON Schema のハイブリッド**

- `docs/openapi.yaml` — HTTP エンドポイント仕様
- `docs/ws-schema.json` — WebSocket メッセージの discriminated union JSON Schema

## Consequences

- Pros: 実装前に interface が固まる。AI 補助時の精度が上がる。将来の自分への可読性
- Cons: 2〜4 時間の初期コスト。FastAPI 実装との drift リスク（CI で `/openapi.json` と `docs/openapi.yaml` の比較テストを入れて抑える）
- AsyncAPI は学習コスト + Python/Vue エコシステムの対応が薄いため採用せず。JSON Schema なら既存ツール（`ajv`, `pydantic`）で直接検証可能
