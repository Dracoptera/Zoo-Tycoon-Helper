import type { Biome } from '../constants'
import type { Animal } from '../animals'
import type { SelectedBoard } from './validation'

export function injectPopularityLocked(
  board: SelectedBoard,
  allAnimals: Animal[],
  count: 1 | 2,
  selectedBiomes?: Biome[]
): SelectedBoard {
  const result: SelectedBoard = {
    level1: [...board.level1],
    level2: [...board.level2],
    level3: [...board.level3],
    coSpecies: [...board.coSpecies],
    biomeAssignments: board.biomeAssignments ? new Map(board.biomeAssignments) : undefined
  }

  const existingIds = new Set([...result.level1, ...result.level2, ...result.level3].map(a => a.id))
  let candidates = (allAnimals as Animal[]).filter((a: any) => a.isPopularityLocked && !existingIds.has(a.id))
  if (selectedBiomes && selectedBiomes.length > 0) {
    const filtered = candidates.filter(a => {
      const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
      return bs.some(b => selectedBiomes.includes(b))
    })
    if (filtered.length > 0) candidates = filtered
  }

  const toInject = candidates.slice(0, count)
  for (const cand of toInject) {
    const levelArray = cand.level === 1 ? result.level1 : cand.level === 2 ? result.level2 : result.level3
    const candBiomes = Array.isArray(cand.biome) ? cand.biome : [cand.biome]
    let idx = levelArray.findIndex((a: any) => {
      if (a.isPopularityLocked) return false
      const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
      return bs.some(b => candBiomes.includes(b))
    })
    if (idx === -1) idx = levelArray.findIndex((a: any) => !a.isPopularityLocked)
    if (idx !== -1) {
      levelArray[idx] = cand
    } else if (cand.level === 1 && levelArray.length < 9) {
      levelArray.push(cand)
    } else if (cand.level === 2 && levelArray.length < 10) {
      levelArray.push(cand)
    } else if (cand.level === 3 && levelArray.length < 5) {
      levelArray.push(cand)
    }
  }

  return result
}

export default { injectPopularityLocked }


