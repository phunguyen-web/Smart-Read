# Smart-Read

Web app to edit PDFs in the browser and convert them to TXT, HTML, DOCX/DOC, EPUB, and MOBI.

## Layout

| Path | Role |
| --- | --- |
| `apps/web` | Vite + React UI (editor + converter) |
| `smart-read` | BDK orchestrator agent and sequenced subagents |
| `.cursor/agents` | Cursor specialists used while coding this repo |

## Agent sequence

1. `product-planner`
2. `web-engineer`
3. `pdf-editor`
4. `format-converter`
5. `qa-reviewer`

The orchestrator records the current stage (`list_pipeline`, `advance_stage`) and the product plan (`record_plan`).

## Web app

```bash
cd apps/web
npm install
npm run dev
```

Open the printed local URL. Use **Chỉnh sửa PDF** to rotate, delete, reorder, merge (start / after current / end), and overlay text at a click or preset. Keyboard: ← →, R, Delete, Alt+↑↓. Use **Chuyển đổi định dạng** to export TXT, HTML, DOCX/DOC, EPUB (nav + per-page spine), or MOBI. MOBI calls `/api/mobi` which runs Calibre `ebook-convert` when installed; otherwise the app downloads EPUB.

Uploads stay in memory. Maximum size is 20 MB. There is no account or cloud store in v1.

## Orchestrator

```bash
cd smart-read
npm install
npx @cursor/bdk@0.2.27 validate --dir .
npx @cursor/bdk@0.2.27 info --dir . --json
npx @cursor/bdk@0.2.27 call list_pipeline --dir .
npx @cursor/bdk@0.2.27 dev --dir .
```

Model turns need a Cursor API key (`CURSOR_API_KEY` or `npx @cursor/bdk@0.2.27 login`). Direct tool calls do not.
