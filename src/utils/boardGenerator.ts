import type { Animal } from '../animals'
import type { CoSpecies } from '../co-species'
import { SelectedBoard, validateBoard } from './validation'
import { categories, biomes } from '../constants'
import type { Category, Biome } from '../constants'

type GenerationOptions = {
  preferredBiomes?: Biome[]
  excludeBiomes?: Biome[]
  seed?: number
}

// Simple random number generator from seed
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

function meetsRequirement(animal: Animal, selectedAnimals: Animal[]): boolean {
  if (!animal.requirement) return true
  
  const allAnimals = selectedAnimals
  const reqCategories = Array.isArray(animal.requirement.category) 
    ? animal.requirement.category 
    : [animal.requirement.category]
  
  const count = reqCategories.reduce((sum, cat) => {
    return sum + allAnimals.filter(a => {
      const categories = Array.isArray(a.category) ? a.category : [a.category]
      return categories.includes(cat)
    }).length
  }, 0)
  
  return count >= animal.requirement.count
}

export function generateBoard(
  allAnimals: Animal[],
  allCoSpecies: CoSpecies[],
  options: GenerationOptions = {}
): SelectedBoard | null {
  const { preferredBiomes = [], excludeBiomes = [], seed } = options
  const random = seed !== undefined ? seededRandom(seed) : Math.random
  const maxAttempts = 100

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board: SelectedBoard = {
      level1: [],
      level2: [],
      level3: [],
      coSpecies: []
    }

    // Filter animals by biome preferences
    let availableLevel1 = allAnimals.filter(a => a.level === 1)
    let availableLevel2 = allAnimals.filter(a => a.level === 2)
    let availableLevel3 = allAnimals.filter(a => a.level === 3)

    if (preferredBiomes.length > 0) {
      availableLevel1 = availableLevel1.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return biomes.some(b => preferredBiomes.includes(b))
      })
      availableLevel2 = availableLevel2.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return biomes.some(b => preferredBiomes.includes(b))
      })
      availableLevel3 = availableLevel3.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return biomes.some(b => preferredBiomes.includes(b))
      })
    }

    if (excludeBiomes.length > 0) {
      availableLevel1 = availableLevel1.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return !biomes.some(b => excludeBiomes.includes(b))
      })
      availableLevel2 = availableLevel2.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return !biomes.some(b => excludeBiomes.includes(b))
      })
      availableLevel3 = availableLevel3.filter(a => {
        const biomes = Array.isArray(a.biome) ? a.biome : [a.biome]
        return !biomes.some(b => excludeBiomes.includes(b))
      })
    }

    // Shuffle available animals
    availableLevel1 = shuffle(availableLevel1, random)
    availableLevel2 = shuffle(availableLevel2, random)
    availableLevel3 = shuffle(availableLevel3, random)

    // Try to fill Level 1 (9 animals)
    for (const animal of availableLevel1) {
      if (board.level1.length >= 9) break
      if (meetsRequirement(animal, board.level1)) {
        board.level1.push(animal)
      }
    }

    if (board.level1.length < 9) continue // Try again

    // Try to fill Level 2 (9 animals)
    const selectedForRequirements = [...board.level1]
    for (const animal of availableLevel2) {
      if (board.level2.length >= 9) break
      if (meetsRequirement(animal, selectedForRequirements)) {
        board.level2.push(animal)
        selectedForRequirements.push(animal)
      }
    }

    if (board.level2.length < 9) continue // Try again

    // Try to fill Level 3 (5 animals)
    for (const animal of availableLevel3) {
      if (board.level3.length >= 5) break
      if (meetsRequirement(animal, selectedForRequirements)) {
        board.level3.push(animal)
        selectedForRequirements.push(animal)
      }
    }

    if (board.level3.length < 5) continue // Try again

    // Validate the board
    const validation = validateBoard(board)
    if (validation.valid) {
      return board
    }
  }

  return null // Could not generate valid board
}

