import { PDFDocument } from '@cantoo/pdf-lib'

export const MAX_PDF_PASSWORD = 128

export class PdfPasswordRequiredError extends Error {
  constructor() {
    super('PDF này đang khóa. Nhập mật khẩu để mở.')
    this.name = 'PdfPasswordRequiredError'
  }
}

export function isPdfPasswordError(error: unknown): boolean {
  if (error instanceof PdfPasswordRequiredError) {
    return true
  }
  const message = error instanceof Error ? error.message : String(error)
  return /encrypt/i.test(message)
}

/** Trim and validate a PDF password. Confirm must match when given. */
export function assertPdfPassword(
  password: string,
  confirm?: string,
  purpose: 'lock' | 'open' = 'lock',
): string {
  const secret = password.normalize('NFC').trim()
  if (!secret) {
    throw new Error(purpose === 'open' ? 'Nhập mật khẩu để mở PDF.' : 'Nhập mật khẩu để khóa PDF.')
  }
  if (secret.length > MAX_PDF_PASSWORD) {
    throw new Error('Mật khẩu quá dài.')
  }
  if (confirm !== undefined && confirm.normalize('NFC').trim() !== secret) {
    throw new Error('Hai mật khẩu không khớp.')
  }
  return secret
}

/**
 * Encrypt a copy for download. The working document stays readable.
 * Uses the same password for user and owner.
 */
export async function encryptPdfForDownload(
  bytes: Uint8Array,
  password: string,
  confirm?: string,
): Promise<Uint8Array> {
  const secret = assertPdfPassword(password, confirm)
  const doc = await PDFDocument.load(bytes)
  if (doc.getPageCount() < 1) {
    throw new Error('Không có trang để khóa.')
  }
  doc.encrypt({
    userPassword: secret,
    ownerPassword: secret,
  })
  return new Uint8Array(await doc.save())
}

/**
 * Decrypt a password-protected PDF into a working copy.
 * The returned bytes are unencrypted so pdf-lib and pdfjs can edit them.
 */
export async function decryptPdfForEdit(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const secret = assertPdfPassword(password, undefined, 'open')
  try {
    const doc = await PDFDocument.load(bytes, { password: secret })
    if (doc.getPageCount() < 1) {
      throw new Error('Không có trang để mở.')
    }
    return new Uint8Array(await doc.save())
  } catch (error) {
    if (error instanceof Error && /trang để mở|Mật khẩu quá dài|Nhập mật khẩu/.test(error.message)) {
      throw error
    }
    if (isPdfPasswordError(error) || /password/i.test(error instanceof Error ? error.message : String(error))) {
      throw new Error('Mật khẩu không đúng.')
    }
    throw error
  }
}
