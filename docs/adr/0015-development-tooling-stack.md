---
status: accepted
date: 2026-04-20
---

# ADR-0015: 開発ツールスタック

## Context

Python（backend / whisper-service）と TypeScript/Vue（frontend）の双方で、パッケージ管理・Lint・フォーマッタ・型検査・テストの標準ツールを揃える必要がある。個人ツール規模に収まりつつ、AI コーディング補助・CI 速度・ロックファイルの再現性が効く組み合わせを選びたい。

## Decision

**Python**

| 用途 | ツール |
| --- | --- |
| パッケージ管理 + Python バージョン管理 | **uv** |
| Lint + Format + Import sort | **ruff** |
| 型検査 | **mypy** |
| テスト | **pytest** |

**TypeScript / Vue**

| 用途 | ツール |
| --- | --- |
| パッケージ管理 | **pnpm** |
| Lint | **ESLint + eslint-plugin-vue** |
| Format | **Prettier** |
| 型検査 | **vue-tsc** |
| テスト | **vitest** |

**タスクランナ**: **Makefile**

## Consequences

- Python 側は ruff と uv が同じ Astral 系列で設計思想が揃っており、CI でも Rust 実装の速度を享受できる
- Vue 側は ESLint + eslint-plugin-vue の成熟度を優先。Biome に集約する案もあるが Vue SFC 対応がまだ薄い
- Makefile は tab/space の癖があるが追加インストールゼロのメリットが勝る

## Options（不採用）

- Python パッケージ管理: poetry（uv より桁違いに遅い）、pip + venv（lockfile が標準でなく再現性に難）
- Python Lint/Format: black + flake8 + isort + pylint（ruff で 1 ツール集約可能）
- Node パッケージ管理: npm（遅い・phantom dep）、bun（Vite との組み合わせでエッジケース）
- Vue Lint/Format: Biome（Vue SFC サポート未成熟）
- タスクランナ: justfile（`just` インストールが必要）、mise tasks（タスク機能が若い）

## References

- uv: https://github.com/astral-sh/uv
- ruff: https://github.com/astral-sh/ruff
- pnpm: https://pnpm.io/
- vitest: https://vitest.dev/
