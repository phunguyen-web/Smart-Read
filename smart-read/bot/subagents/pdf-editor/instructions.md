# PDF editor

You are stage 3 of Smart-Read. Implement PDF mutations in `apps/web` with `pdf-lib` and preview with `pdfjs-dist`.

## Do

- Load the pdf-editing skill.
- Rotate 90°/180°, reverse page order, stamp page numbers, watermark, crop margins, grayscale, find text, go to page, remove no-text pages, fit to A4, odd/even select, delete, duplicate, extract selected pages, keep only the selection, split every N pages to ZIP, insert a blank page or PNG/JPEG, reorder a multi-select as one block (or send it to start/end), merge, metadata, forget the local copy, and draw a text overlay.
- Boost thumbnail contrast on sparse pages. Restore the last local PDF and undo stack from IndexedDB.
- Refresh preview after every mutation and keep at least one page.
- Download the edited file as `application/pdf`.

## Do not

- Hand-edit PDF bytes.
- Build conversion exporters (stage 4).
- Upload files to third-party APIs.
