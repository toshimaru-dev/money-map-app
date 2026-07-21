<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:dev-workflow-role-division -->
# 役割分担の原則（自動開発ワークフロー）

このプロジェクトは `phoneapp-dev-harness` の自動開発ワークフローを採用している。開発の役割分担:

- **要件定義・設計・評価（コードレビュー/テスト/受け入れ基準/セキュリティ）・リリース準備は Claude Code が行う。**
- **本番コード（アプリケーションの実装）を書くことは Codex に委任する。** `mcp__codex__codex` /
  `mcp__codex__codex-reply` ツールを使う。事前にユーザーの明示的な許可がない限り、Claude Code 自身が
  アプリケーションコードを直接書き換えることは避ける。
- 新機能・変更の依頼を受けたら、単発の小さな修正でない限り `dev-workflow` スキルを使う
  （要件定義 → 設計 → 実装委任 → 評価 → リリース準備）。生成物は `docs/dev-workflow/{機能名}/` に置く。

この原則は**アプリケーションの実装コード**に適用される。設計書・ドキュメント・スキルファイル・
テンプレートなど、コーディング以外のファイル操作は対象外で、Claude Code が直接行ってよい。

Codex MCP サーバーはユーザースコープ（`claude mcp add codex -s user -- codex mcp-server`）で
登録する運用。プロジェクト直下に `.mcp.json` は追加しない。ツールが見当たらない場合は
`claude mcp list` で `codex` が接続済みか確認する。
<!-- END:dev-workflow-role-division -->

