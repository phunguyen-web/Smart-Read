import { PDFDocument } from '@cantoo/pdf-lib'

export const MAX_PDF_PASSWORD = 128

/** Trim and validate a download-only PDF password. Confirm must match when given. */
export function assertPdfPassword(password: string, confirm?: string): string {
  const secret = password.normalize('NFC').trim()
  if (!secret) {
    throw new Error('Nhập mật khẩu để khóa PDF.')
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
