import type { ScreenQuad } from './landing-story'

/**
 * The HTML screen layer is authored on a fixed canvas and projected onto the
 * laptop display with a CSS matrix3d homography. 1240x800 roughly matches the
 * display aspect of the MacBook in the mockup footage.
 */
export const SCREEN_LAYER_WIDTH = 1240
export const SCREEN_LAYER_HEIGHT = 800

const VIDEO_WIDTH = 1920
const VIDEO_HEIGHT = 1080

/** Slight overshoot so the projected layer never leaves a dark seam. */
const QUAD_EXPANSION = 1.006

interface Point {
  x: number
  y: number
}

/** Solves a linear system with Gaussian elimination (partial pivoting). */
function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  const size = vector.length
  const rows = matrix.map((row, index) => [...row, vector[index]!])

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row]![column]!) > Math.abs(rows[pivotRow]![column]!)) {
        pivotRow = row
      }
    }
    if (Math.abs(rows[pivotRow]![column]!) < 1e-10) return null
    ;[rows[column], rows[pivotRow]] = [rows[pivotRow]!, rows[column]!]

    for (let row = column + 1; row < size; row += 1) {
      const factor = rows[row]![column]! / rows[column]![column]!
      for (let k = column; k <= size; k += 1) {
        rows[row]![k]! -= factor * rows[column]![k]!
      }
    }
  }

  const solution = new Array<number>(size).fill(0)
  for (let row = size - 1; row >= 0; row -= 1) {
    let sum = rows[row]![size]!
    for (let k = row + 1; k < size; k += 1) {
      sum -= rows[row]![k]! * solution[k]!
    }
    solution[row] = sum / rows[row]![row]!
  }

  return solution
}

/** Homography mapping the (0,0)-(w,h) rectangle onto the destination quad. */
function computeHomography(width: number, height: number, dst: Point[]): number[] | null {
  const src: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ]

  const system: number[][] = []
  const rhs: number[] = []

  for (let i = 0; i < 4; i += 1) {
    const s = src[i]!
    const d = dst[i]!
    system.push([s.x, s.y, 1, 0, 0, 0, -s.x * d.x, -s.y * d.x])
    rhs.push(d.x)
    system.push([0, 0, 0, s.x, s.y, 1, -s.x * d.y, -s.y * d.y])
    rhs.push(d.y)
  }

  return solveLinearSystem(system, rhs)
}

/**
 * Computes the CSS matrix3d that projects the screen layer onto the laptop
 * display quad, given the current size of the stage that hosts the
 * object-fit: contain video.
 */
export function computeScreenMatrix(
  quad: ScreenQuad,
  stageWidth: number,
  stageHeight: number
): string | null {
  if (stageWidth <= 0 || stageHeight <= 0) return null

  const scale = Math.min(stageWidth / VIDEO_WIDTH, stageHeight / VIDEO_HEIGHT)
  const displayWidth = VIDEO_WIDTH * scale
  const displayHeight = VIDEO_HEIGHT * scale
  const offsetX = (stageWidth - displayWidth) / 2
  const offsetY = (stageHeight - displayHeight) / 2

  const corners = [quad.tl, quad.tr, quad.br, quad.bl]
  const centroidX = corners.reduce((sum, corner) => sum + corner[0], 0) / 4
  const centroidY = corners.reduce((sum, corner) => sum + corner[1], 0) / 4

  const dst: Point[] = corners.map(([x, y]) => ({
    x: offsetX + (centroidX + (x - centroidX) * QUAD_EXPANSION) * displayWidth,
    y: offsetY + (centroidY + (y - centroidY) * QUAD_EXPANSION) * displayHeight,
  }))

  const h = computeHomography(SCREEN_LAYER_WIDTH, SCREEN_LAYER_HEIGHT, dst)
  if (!h) return null

  // matrix3d is column-major; the homography is embedded in the x/y/w rows.
  const matrix = [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1]

  return `matrix3d(${matrix.map(value => Number(value!.toFixed(8))).join(',')})`
}
