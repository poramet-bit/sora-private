/**
 * Converts a base64 Data URI (e.g. "data:image/jpeg;base64,...") to a Uint8Array.
 * Useful for passing image binary data to Cloudflare Workers AI vision models.
 */
export function dataURItoUint8Array(dataURI: string): Uint8Array | null {
  try {
    const parts = dataURI.split(',')
    if (parts.length < 2) return null

    const base64Data = parts[1]
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  } catch (err) {
    console.error('Failed to parse base64 Data URI:', err)
    return null
  }
}
