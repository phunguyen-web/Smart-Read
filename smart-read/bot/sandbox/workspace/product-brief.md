# Smart-Read product brief

Web app to edit PDFs in the browser and convert them to other reading/editing formats.

## Must have

- Upload a PDF (max 20 MB), preview pages (stronger scale on small/sparse pages).
- Edit: thumbnail strip (strong contrast on sparse pages), multi-select rotate/delete/duplicate, extract selected pages as a new PDF, insert a blank page, drag a selection as one block, undo/redo, merge at a chosen position, click-to-place text overlay; download the result as PDF. Reload in the same browser restores the last PDF locally; the user can forget that copy.
- Convert: TXT, HTML, DOCX/DOC, EPUB, MOBI, optional page range with explicit empty/invalid-range errors, or the editor's multi-page selection (including non-contiguous pages).

## Out of scope for v1

- Accounts, cloud storage, OCR of scanned-only PDFs, collaborative editing.
