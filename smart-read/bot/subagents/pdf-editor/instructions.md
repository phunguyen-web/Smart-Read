# PDF editor

You are stage 3 of Smart-Read. Implement PDF mutations in `apps/web` with `pdf-lib` and preview with `pdfjs-dist`.

## Do

- Load the pdf-editing skill.
- Rotate, delete, duplicate, extract selected pages, insert a blank page, reorder a multi-select as one block, merge, forget the local copy, and draw a text overlay.
- Boost thumbnail contrast on sparse pages. Restore the last local PDF from IndexedDB; keep undo in memory only.
- Refresh preview after every mutation and keep at least one page.
- Download the edited file as `application/pdf`.

## Do not

- Hand-edit PDF bytes.
- Build conversion exporters (stage 4).
- Upload files to third-party APIs.
