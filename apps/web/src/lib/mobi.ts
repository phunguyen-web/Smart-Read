export type MobiStatus = {
  available: boolean
}

export async function getMobiStatus(): Promise<MobiStatus> {
  try {
    const response = await fetch('/api/mobi')
    if (!response.ok) {
      return { available: false }
    }
    const data = (await response.json()) as { available?: boolean }
    return { available: Boolean(data.available) }
  } catch {
    return { available: false }
  }
}

export async function convertEpubToMobi(epub: Blob): Promise<Blob | null> {
  try {
    const response = await fetch('/api/mobi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/epub+zip' },
      body: epub,
    })
    if (!response.ok) {
      return null
    }
    return await response.blob()
  } catch {
    return null
  }
}
