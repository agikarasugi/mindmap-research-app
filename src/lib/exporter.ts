import { toPng, toJpeg, toSvg } from 'html-to-image'

export type ExportFormat = 'png' | 'jpg' | 'svg'

const PADDING = 48      // px around content in the output image
const MAX_DIM = 8192    // cap to avoid absurdly large outputs

/**
 * Export the React Flow graph to a data URL.
 *
 * Must be called with the `.react-flow__viewport` element and a pre-computed
 * transform (from getViewportForBounds) so that the entire graph fits in the
 * output dimensions.  Targeting the viewport element (not the outer wrapper)
 * ensures edge SVG strokes and their CSS are captured correctly.
 */
export async function exportViewportToDataUrl(
  viewportEl: HTMLElement,
  format: ExportFormat,
  width: number,
  height: number,
  transform: { x: number; y: number; zoom: number },
  backgroundColor: string,
): Promise<string> {
  const opts = {
    backgroundColor,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      transformOrigin: '0 0',
    },
  }

  if (format === 'png') return toPng(viewportEl, { ...opts, pixelRatio: 2 })
  if (format === 'jpg') return toJpeg(viewportEl, { ...opts, pixelRatio: 2, quality: 0.95 })
  return toSvg(viewportEl, opts)
}

/** Compute image dimensions from a bounding box, clamped to MAX_DIM. */
export function boundsToImageSize(bounds: { width: number; height: number }) {
  const w = Math.min(Math.max(Math.ceil(bounds.width)  + PADDING * 2, 400), MAX_DIM)
  const h = Math.min(Math.max(Math.ceil(bounds.height) + PADDING * 2, 300), MAX_DIM)
  return { width: w, height: h }
}
