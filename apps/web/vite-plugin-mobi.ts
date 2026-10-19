import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'

const MAX_BYTES = 20 * 1024 * 1024
const CONVERT_TIMEOUT_MS = 60_000

async function findEbookConvert(): Promise<string | null> {
  const candidates = [
    'ebook-convert',
    '/usr/bin/ebook-convert',
    '/usr/local/bin/ebook-convert',
  ]
  for (const bin of candidates) {
    if (bin.includes('/')) {
      try {
        await access(bin, fsConstants.X_OK)
        return bin
      } catch {
        continue
      }
    }
    const resolved = await which(bin)
    if (resolved) {
      return resolved
    }
  }
  return null
}

function which(bin: string): Promise<string | null> {
  return new Promise((resolve) => {
    const child = spawn('which', [bin], { stdio: ['ignore', 'pipe', 'ignore'] })
    let out = ''
    child.stdout.on('data', (chunk: Buffer | string) => {
      out += String(chunk)
    })
    child.on('error', () => resolve(null))
    child.on('close', (code) => {
      const path = out.trim()
      resolve(code === 0 && path ? path : null)
    })
  })
}

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('Tệp vượt quá 20 MB.'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function runConvert(bin: string, input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, [input, output], { stdio: ['ignore', 'pipe', 'pipe'] })
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error('ebook-convert hết thời gian.'))
    }, CONVERT_TIMEOUT_MS)
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`ebook-convert exited ${code ?? 'null'}`))
    })
  })
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: unknown) => void,
): Promise<void> {
  const url = req.url ?? ''
  if (!url.startsWith('/api/mobi')) {
    next()
    return
  }

  const bin = await findEbookConvert()

  if (req.method === 'GET') {
    sendJson(res, 200, { available: Boolean(bin), binary: bin })
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!bin) {
    sendJson(res, 501, {
      fallback: 'epub',
      reason: 'Calibre ebook-convert is not installed on this machine.',
    })
    return
  }

  let epub: Buffer
  try {
    epub = await readBody(req, MAX_BYTES)
  } catch (error) {
    sendJson(res, 413, {
      fallback: 'epub',
      reason: error instanceof Error ? error.message : 'payload too large',
    })
    return
  }

  if (epub.byteLength === 0) {
    sendJson(res, 400, { fallback: 'epub', reason: 'empty body' })
    return
  }

  const dir = await mkdtemp(join(tmpdir(), 'smart-read-mobi-'))
  const input = join(dir, 'book.epub')
  const output = join(dir, 'book.mobi')
  try {
    await writeFile(input, epub)
    await runConvert(bin, input, output)
    const mobi = await readFile(output)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/x-mobipocket-ebook')
    res.setHeader('Content-Length', String(mobi.byteLength))
    res.end(mobi)
  } catch (error) {
    sendJson(res, 501, {
      fallback: 'epub',
      reason: error instanceof Error ? error.message : 'conversion failed',
    })
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function attach(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((req, res, next) => {
    void handle(req, res, next)
  })
}

export function mobiConvertPlugin(): Plugin {
  return {
    name: 'smart-read-mobi-convert',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}
