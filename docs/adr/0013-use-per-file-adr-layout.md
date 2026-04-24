---
status: accepted
date: 2026-04-20
---

# ADR-0013: ADR は per-file レイアウトで管理する

## Context

アーキテクチャ判断の記録は当初 `docs/architecture.md` 単一ファイルに ADR-001〜011 を集約していた。ADR-0012（OpenAPI 採用）で方針変更が発生したのを機に、supersede チェーンを正確に表現できる標準形式へ移行する必要が出た。

## Options

| 案 | 概要 |
| --- | --- |
| A | `docs/adr/NNNN-*.md` に per-file 分割（Nygard/MADR 準拠） |
| B | 既存 `architecture.md` は残し、新規 ADR のみ `docs/adr/` へ |
| C | 単一ファイルのまま、各 ADR に `Status:` 行を追加 |

## Decision

**A. per-file 分割（完全移行）**

- ディレクトリ: `docs/adr/`
- ファイル名: `NNNN-imperative-verb-phrase.md`（kebab-case、4 桁連番）
- フォーマット: MADR ライトな YAML frontmatter (`status`, `date`) + Context / Options / Decision / Consequences
- supersede 時: 新 ADR を起こし、旧 ADR の `status` を `superseded by ADR-NNNN` に書き換える（本文は不変）
- インデックス: `docs/adr/README.md`

## Consequences

- Pros: デファクト準拠で外部ツール（adr-tools, log4brains）と互換。supersede チェーンを追跡可能。将来の分量増加に耐える
- Cons: 既存 11 件の分割コスト（一度だけ機械的作業）。ADR 件数が少ない間はオーバースペック感はある
- 本プロジェクトでは ADR-0012 から開始する OpenAPI 採用の経緯を残すタイミングで全体移行する

## References

- Michael Nygard (2011) "Documenting Architecture Decisions" — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- ADR GitHub Organization — https://adr.github.io/
- MADR — https://adr.github.io/madr/
- joelparkerhenderson, Architecture Decision Record (ADR) — https://github.com/joelparkerhenderson/architecture-decision-record
