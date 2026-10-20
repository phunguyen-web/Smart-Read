# Smart-Read product brief

Web app to edit PDFs in the browser and convert them to other reading/editing formats.

## Must have

- Upload a PDF (max 20 MB), preview pages (stronger scale on small/sparse pages).
- Edit: thumbnail strip (strong contrast on sparse pages), multi-select rotate 90°/180°, reverse page order, interleave two halves (duplex scan) or split odd/even, stamp page numbers, watermark, crop margins, grayscale, find text (diacritic-insensitive), go to page, remove pages with no extracted text or with duplicate text, fit selected pages to A4, odd/even/invert select, delete/duplicate, extract selected pages as a new PDF, keep only the selection, split every N pages into a ZIP of PDFs, insert a blank page or PNG/JPEG images, drag a selection as one block (or send it to start/end), undo/redo (persisted locally), merge at a chosen position, PDF title/author/subject, click-to-place text overlay; download the result as PDF. Reload in the same browser restores the last PDF and undo stack locally; the user can forget that copy.
- Convert: TXT, HTML, Markdown, RTF, JSON, CSV, DOCX/DOC, ODT, FB2, EPUB, MOBI, PNG, JPEG, optional page range with explicit empty/invalid-range errors, or the editor's multi-page selection (including non-contiguous pages). Opening TXT/Markdown/HTML/JSON/CSV/RTF, DOCX, ODT, FB2, EPUB, or PNG/JPEG builds a PDF first so those formats can round-trip.

## Out of scope for v1

- Accounts, cloud storage, OCR of scanned-only PDFs, collaborative editing.
