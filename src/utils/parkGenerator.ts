import type { Biome } from '../constants'
import type { Animal } from '../animals'
import type { CoSpecies } from '../co-species'
import { sampleBoards } from '../sampleBoards'
import animalsData from '../animals'

type ParkGenerationOptions = {
  seed?: number
  count?: number // number of parks to generate
  size?: 4 | 5 // animals per park
  selectedBiomes?: Biome[]
  compatibleWithBaseGame?: boolean
  availableCoSpecies?: CoSpecies[]
}

export type GeneratedPark = {
  id: string
  name: string
  biome: Biome
  animalIds: string[]
  score: number
  coSpeciesIds: string[]
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function shuffle<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function scoreParkAnimals(animals: Animal[], targetBiome: Biome): number {
  const biomeCohesion = animals.filter(a => {
    const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
    return bs.includes(targetBiome)
  }).length / animals.length

  const categories = new Set<string>()
  animals.forEach(a => {
    const cats = Array.isArray(a.category) ? a.category : [a.category]
    cats.forEach(c => categories.add(c))
  })
  const categoryDiversity = Math.min(categories.size / 4, 1)

  const hasHigherLevel = animals.some(a => a.level >= 2) ? 1 : 0

  return biomeCohesion * 0.5 + categoryDiversity * 0.3 + hasHigherLevel * 0.2
}

function getBaseGameGroupSizes(): Set<string | number> {
  const baseGameBoard = sampleBoards.find(b => b.name === 'Base Game')
  if (!baseGameBoard) return new Set()
  const allAnimals = animalsData.animals
  const groupSizes = new Set<string | number>()
  const baseGameAnimalIds = [
    ...baseGameBoard.board.level1,
    ...baseGameBoard.board.level2,
    ...baseGameBoard.board.level3
  ]
  baseGameAnimalIds.forEach(animalIdOrAnimal => {
    const animalId = typeof animalIdOrAnimal === 'string' ? animalIdOrAnimal : animalIdOrAnimal.id
    const animal = allAnimals.find(a => a.id === animalId)
    if (animal) {
      if (animal.groupSize.level1 != null) groupSizes.add(animal.groupSize.level1)
      if (animal.groupSize.level2 != null) groupSizes.add(animal.groupSize.level2)
      if (animal.groupSize.level3 != null) groupSizes.add(animal.groupSize.level3)
    }
  })
  return groupSizes
}

export function generateBalancedParks(
  allAnimals: Animal[],
  options: ParkGenerationOptions = {}
): GeneratedPark[] {
  const seed = options.seed ?? Date.now()
  const random = seededRandom(seed)

  let candidateAnimals = [...allAnimals]
  if (options.selectedBiomes && options.selectedBiomes.length > 0) {
    candidateAnimals = candidateAnimals.filter(a => {
      const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
      return bs.some(b => options.selectedBiomes!.includes(b))
    })
  }
  if (options.compatibleWithBaseGame) {
    const validSizes = getBaseGameGroupSizes()
    candidateAnimals = candidateAnimals.filter(a => {
      const l1 = a.groupSize.level1, l2 = a.groupSize.level2, l3 = a.groupSize.level3
      return (l1 != null && validSizes.has(l1)) || (l2 != null && validSizes.has(l2)) || (l3 != null && validSizes.has(l3))
    })
  }

  const parks: GeneratedPark[] = []
  const count = options.count ?? 3
  const size = options.size ?? 5

  const biomePool = options.selectedBiomes && options.selectedBiomes.length > 0
    ? options.selectedBiomes
    : Array.from(new Set(candidateAnimals.flatMap(a => Array.isArray(a.biome) ? a.biome : [a.biome])))

  const tryMakePark = (targetBiome: Biome): GeneratedPark | null => {
    const pool = candidateAnimals.filter(a => {
      const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
      return bs.includes(targetBiome)
    })
    if (pool.length < size) return null

    const shuffled = shuffle(pool, random)
    const pick: Animal[] = []
    const seenCats = new Set<string>()
    let lockedCount = 0
    for (const a of shuffled) {
      const cats = Array.isArray(a.category) ? a.category : [a.category]
      const addsNew = cats.some(c => !seenCats.has(c))
      const isLocked = !!(a as any).isPopularityLocked
      if ((addsNew || pick.length < size - 1) && (lockedCount === 0 || !isLocked)) {
        pick.push(a)
        cats.forEach(c => seenCats.add(c))
        if (isLocked) lockedCount++
        if (pick.length === size) break
      }
    }
    if (pick.length < size) {
      const remaining = shuffled.filter(a => !pick.includes(a)).slice(0, size - pick.length)
      for (const r of remaining) {
        const isLocked = !!(r as any).isPopularityLocked
        if (lockedCount >= 1 && isLocked) continue
        pick.push(r)
        if (isLocked) lockedCount++
        if (pick.length === size) break
      }
    }

    if (new Set(pick.map(a => (Array.isArray(a.category) ? a.category : [a.category]).join('|'))).size < 3) return null

    // If the park includes a popularity-locked animal, enforce exactly 4 main species (no co-species)
    let hasLocked = pick.some(a => !!(a as any).isPopularityLocked)
    if (hasLocked && pick.length > 4) {
      // Keep the locked animal and the first other animals until reaching 4 total
      const locked = pick.find(a => !!(a as any).isPopularityLocked)!
      const others = pick.filter(a => a !== locked)
      pick.length = 0
      pick.push(locked, ...others.slice(0, 3))
    }

    const score = scoreParkAnimals(pick, targetBiome)
    // Add co-species unless there is a popularity-locked animal
    hasLocked = pick.some(a => !!(a as any).isPopularityLocked)
    let coSpeciesIds: string[] = []
    if (!hasLocked && options.availableCoSpecies && options.availableCoSpecies.length > 0) {
      const candidates = options.availableCoSpecies.filter(c => {
        const bs = Array.isArray(c.biome) ? c.biome : [c.biome]
        return bs.includes(targetBiome)
      })
      if (candidates.length > 0) {
        coSpeciesIds = [candidates[0].id]
      }
    }
    const id = `generated-park-${targetBiome}-${Math.floor(random()*1e6)}`
    const name = `Custom Park (${targetBiome})`
    return { id, name, biome: targetBiome, animalIds: pick.map(a => a.id), score, coSpeciesIds }
  }

  const attemptsPerBiome = 8
  for (const biome of shuffle(biomePool, random)) {
    const candidates: GeneratedPark[] = []
    for (let i = 0; i < attemptsPerBiome; i++) {
      const gp = tryMakePark(biome)
      if (gp) candidates.push(gp)
    }
    if (candidates.length > 0) {
      const best = candidates.sort((a, b) => b.score - a.score)[0]
      parks.push(best)
      if (parks.length >= count) break
    }
  }

  // Fallback: if we didn't hit the requested count (e.g., due to limited biomes),
  // keep generating from available biomes allowing repeats until we reach count or exhaust tries
  if (parks.length < count && biomePool.length > 0) {
    const extraRounds = 3
    for (let r = 0; r < extraRounds && parks.length < count; r++) {
      for (const biome of shuffle(biomePool, random)) {
        const gp = tryMakePark(biome)
        if (gp) {
          parks.push(gp)
          if (parks.length >= count) break
        }
      }
    }
  }

  return parks
}

export default { generateBalancedParks }


