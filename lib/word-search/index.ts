export function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

export interface CellCoord {
  row: number
  col: number
}

export interface WordPlacement {
  word: string
  displayWord: string
  row: number
  col: number
  dr: number
  dc: number
}

export function getCellsForPlacement(placement: WordPlacement): CellCoord[] {
  const cells: CellCoord[] = []
  for (let i = 0; i < placement.word.length; i++) {
    cells.push({
      row: placement.row + placement.dr * i,
      col: placement.col + placement.dc * i,
    })
  }
  return cells
}

export function getSelectionWord(grid: string[][], start: CellCoord, end: CellCoord): string | null {
  const dr = end.row - start.row
  const dc = end.col - start.col
  const steps = Math.max(Math.abs(dr), Math.abs(dc))
  if (steps === 0) return grid[start.row]?.[start.col] ?? null

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
  if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return null

  let letters = ''
  for (let i = 0; i <= steps; i++) {
    const r = start.row + stepR * i
    const c = start.col + stepC * i
    const letter = grid[r]?.[c]
    if (!letter) return null
    letters += letter
  }
  return letters
}

export function matchWord(
  selection: string,
  placements: WordPlacement[],
): WordPlacement | null {
  const normalized = normalizeWord(selection)
  const reversed = normalized.split('').reverse().join('')
  for (const p of placements) {
    if (p.word === normalized || p.word === reversed) return p
  }
  return null
}

export function cellsKey(row: number, col: number): string {
  return `${row},${col}`
}

export function isCellInSet(row: number, col: number, set: Set<string>): boolean {
  return set.has(cellsKey(row, col))
}
