// Client side image preparation for uploads.
// Vercel rejects request bodies over ~4.5 MB at the edge, without CORS
// headers, which the browser reports as a bare "Network Error". So large
// photos are downscaled and re encoded here before they ever leave the
// browser, and anything still over the cap is refused with a clear message.

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const MAX_DIMENSION = 2000
const JPEG_QUALITY = 0.85
// Files this small are sent untouched, re encoding would gain nothing.
const SKIP_BELOW_BYTES = 1 * 1024 * 1024

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not read that image file.'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function reencode(file: File): Promise<File> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  // White ground so transparent PNGs do not turn black as JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[a-zA-Z0-9]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}

/**
 * Shrinks a photo to web size (max 2000px, JPEG) when it is large, then
 * enforces the upload cap. Throws an Error with a user readable message
 * when the file cannot be made small enough.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.')
  }

  let prepared = file
  // GIFs and SVGs would lose animation / vectors in a canvas re encode, so
  // they pass through untouched and only hit the size cap below.
  const compressible = /image\/(jpeg|png|webp|avif|heic|heif)/.test(file.type)
  if (compressible && file.size > SKIP_BELOW_BYTES) {
    try {
      prepared = await reencode(file)
    } catch {
      prepared = file
    }
  }

  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `This image is ${formatMb(prepared.size)} after compression and the upload limit is ${formatMb(MAX_UPLOAD_BYTES)}. Please use a smaller image.`,
    )
  }
  return prepared
}
