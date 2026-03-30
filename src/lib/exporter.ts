import { toPng, toJpeg, toSvg } from 'html-to-image'

export type ExportFormat = 'png' | 'jpg' | 'svg'

/**
 * Renders the element to a data URL.
 * Filters out React Flow control overlays (.react-flow__controls, .react-flow__minimap).
 */
export async function exportToDataUrl(
  element: HTMLElement,
  format: ExportFormat,
): Promise<string> {
  const filter = (node: HTMLElement) => {
    const cls = node.classList
    if (!cls) return true
    return (
      !cls.contains('react-flow__controls') &&
      !cls.contains('react-flow__minimap') &&
      !cls.contains('react-flow__background')
    )
  }

  const opts = { filter, pixelRatio: 2 }

  if (format === 'png') return toPng(element, opts)
  if (format === 'jpg') return toJpeg(element, { ...opts, quality: 0.95 })
  return toSvg(element, { filter })
}
