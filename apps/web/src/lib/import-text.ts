export const MAX_IMPORT_CHARS = 200_000
export const MAX_IMPORT_PAGES = 80
export const IMPORT_PAGE_CHARS = 1800

export type ImportedTextKind = 'txt' | 'md' | 'html'

function capPages(pages: string[]): string[] {
  const cleaned = pages.map((page) => page.replaceAll('\u0000', '').trimEnd())
  const nonempty = cleaned.some((page) => page.trim()) ? cleaned : ['']
  if (nonempty.length > MAX_IMPORT_PAGES) {
    throw new Error(`Tệp chữ tạo quá ${MAX_IMPORT_PAGES} trang. Hãy cắt nhỏ rồi tải lại.`)
  }
  return nonempty
}

function assertImportBudget(text: string): string {
  const trimmed = text.replace(/^\uFEFF/, '')
  if (!trimmed.trim()) {
    throw new Error('Tệp chữ trống.')
  }
  if (trimmed.length > MAX_IMPORT_CHARS) {
    throw new Error('Tệp chữ vượt quá giới hạn 200.000 ký tự.')
  }
  return trimmed
}

function chunkParagraphs(text: string, size: number): string[] {
  const blocks = text.split(/\n{2,}/)
  const pages: string[] = []
  let current = ''
  for (const block of blocks) {
    const piece = block.trim()
    if (!piece) {
      continue
    }
    if (!current) {
      current = piece
      continue
    }
    if (current.length + piece.length + 2 <= size) {
      current = `${current}\n\n${piece}`
      continue
    }
    pages.push(current)
    current = piece
  }
  if (current) {
    pages.push(current)
  }
  if (pages.length === 0) {
    return [text]
  }
  const overflow: string[] = []
  for (const page of pages) {
    if (page.length <= size * 2) {
      overflow.push(page)
      continue
    }
    for (let index = 0; index < page.length; index += size) {
      overflow.push(page.slice(index, index + size))
    }
  }
  return overflow
}

export function unescapeHtmlEntities(value: string): string {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

export function stripMarkup(html: string): string {
  return unescapeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\S\n]{2,}/g, ' ')
      .trim(),
  )
}

export function pagesFromPlainText(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^--- Trang \d+ ---/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^--- Trang \d+ ---\s*/m)
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  if (trimmed.includes('\f')) {
    return capPages(
      trimmed
        .split('\f')
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  return capPages(chunkParagraphs(trimmed, IMPORT_PAGE_CHARS))
}

export function pagesFromMarkdown(text: string): string[] {
  const trimmed = assertImportBudget(text)
  if (/^##\s+Trang\s+\d+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/^##\s+Trang\s+\d+\s*$/m)
        .map((page) => page.replace(/^#\s+.*$/m, '').trim())
        .filter((page) => page.length > 0),
    )
  }
  if (/^##\s+/m.test(trimmed)) {
    return capPages(
      trimmed
        .split(/(?=^##\s+)/m)
        .map((page) => page.trim())
        .filter((page) => page.length > 0),
    )
  }
  return pagesFromPlainText(trimmed)
}

export function pagesFromHtml(text: string): string[] {
  const trimmed = assertImportBudget(text)
  const sections = trimmed.match(/<section\b[\s\S]*?<\/section>/gi)
  if (sections && sections.length > 0) {
    return capPages(sections.map((section) => stripMarkup(section)).filter((page) => page.length > 0))
  }
  const headings = trimmed.split(/<h2\b[^>]*>/i)
  if (headings.length > 1) {
    return capPages(
      headings
        .slice(1)
        .map((chunk) => stripMarkup(chunk.replace(/^[\s\S]*?<\/h2>/i, '')))
        .filter((page) => page.length > 0),
    )
  }
  return pagesFromPlainText(stripMarkup(trimmed))
}

export function pagesFromImportedText(kind: ImportedTextKind, text: string): string[] {
  if (kind === 'md') {
    return pagesFromMarkdown(text)
  }
  if (kind === 'html') {
    return pagesFromHtml(text)
  }
  return pagesFromPlainText(text)
}
