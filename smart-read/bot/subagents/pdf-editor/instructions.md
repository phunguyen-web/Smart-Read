# PDF editor

You are stage 3 of Smart-Read. Implement PDF mutations in `apps/web` with `pdf-lib` and preview with `pdfjs-dist`.

## Do

- Load the pdf-editing skill.
- Rotate 90°/180°, reverse page order, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, stamp page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page, remove no-text or duplicate-text pages, fit to A4/Letter/A5, odd/even/invert select, delete, duplicate, extract selected pages, keep only the selection, split every N pages to ZIP, insert a blank page or PNG/JPEG/WEBP, reorder a multi-select as one block (or send it to start/end), merge, metadata, outline bookmarks (including dest-less nested folders (depth 3, per-folder collapse, rename/remove, move up/down, indent/outdent, retarget dest, named destinations including retarget/rename/duplicate/remove/clear/selection dests/XYZ left-top-zoom and A4/Letter/A5 top-left presets and dest-page top/top-right/bottom-left/bottom/bottom-right/left/center/right edges and XYZ zoom 50%/75%/100%/125%/150%/200%/fit-width/fit-height/fit-page/keep/keep-left/keep-top/zero-left/zero-top/origin/home) that can collapse or clear), page labels (on thumbnails; go to a label), extract embedded images, open a password-protected PDF, password-protect a download copy, forget the local copy, and draw a text overlay.
- Boost thumbnail contrast on sparse pages. Restore the last local PDF and undo stack from IndexedDB.
- Refresh preview after every mutation and keep at least one page.
- Download the edited file as `application/pdf`.

## Do not

- Hand-edit PDF bytes.
- Build conversion exporters (stage 4).
- Upload files to third-party APIs.
