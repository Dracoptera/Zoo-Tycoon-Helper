import type { Animal } from '../animals'
import type { CoSpecies } from '../co-species'
import { SelectedBoard, validateBoard } from './validation'
import { categories, biomes } from '../constants'
import type { Category, Biome } from '../constants'

type GenerationOptions = {
  preferredBiomes?: Biome[]
  excludeBiomes?: Biome[]
  seed?: number
  strict?: boolean  // If true, ensures no warnings (balanced board)
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

// Helper to count animals by category
function countByCategory(animals: Animal[], category: Category): number {
  return animals.filter(a => {
    const categories = Array.isArray(a.category) ? a.category : [a.category]
    return categories.includes(category)
  }).length
}

// Helper to count all items (including co-species) by category
function countAllByCategory(items: (Animal | CoSpecies)[], category: Category): number {
  return items.filter(item => {
    const categories = Array.isArray(item.category) ? item.category : [item.category]
    return categories.includes(category)
  }).length
}

// Check if adding an animal would exceed category limits (max 4 per category)
function wouldExceedCategoryLimit(animal: Animal, selectedAnimals: Animal[]): boolean {
  const categories = Array.isArray(animal.category) ? animal.category : [animal.category]
  return categories.some(cat => {
    const count = countByCategory(selectedAnimals, cat)
    return count >= 4  // Allow up to 4 instead of 3
  })
}

// Count Level 1 animals per biome
function countLevel1ByBiome(level1Animals: Animal[], biome: string): number {
  return level1Animals.filter(animal => {
    const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
    return biomes.includes(biome)
  }).length
}

// Check if adding a Level 1 animal to a biome would exceed Level I limit (max 3 per biome)
function wouldExceedLevel1BiomeLimit(animal: Animal, level1Animals: Animal[]): boolean {
  if (animal.level !== 1) return false
  const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
  return biomes.some(biome => countLevel1ByBiome(level1Animals, biome) >= 3)  // Allow up to 3
}

export function generateBoard(
  allAnimals: Animal[],
  allCoSpecies: CoSpecies[],
  options: GenerationOptions = {}
): SelectedBoard | null {
  const { preferredBiomes = [], excludeBiomes = [], seed, strict = false } = options
  const random = seed !== undefined ? seededRandom(seed) : Math.random
  const maxAttempts = strict ? 2000 : 300  // More attempts with relaxed constraints

  // Available biomes (excluding excluded ones)
  const allBiomes = Object.values({
    'Tundra & Steppe': 'Tundra & Steppe',
    'Montane Forest': 'Montane Forest',
    'Rainforest': 'Rainforest',
    'Savannah': 'Savannah',
    'Dry Forest': 'Dry Forest',
    'Water': 'Water'
  }).filter(b => !excludeBiomes.includes(b))

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board: SelectedBoard = {
      level1: [],
      level2: [],
      level3: [],
      coSpecies: []
    }

    // Don't pre-select biomes - let them naturally emerge from selection
    let availableLevel1 = allAnimals.filter(a => a.level === 1)
    let availableLevel2 = allAnimals.filter(a => a.level === 2)
    let availableLevel3 = allAnimals.filter(a => a.level === 3)

    // Old biome filtering is now replaced by selectedBiomes filtering above

    // Shuffle available animals
    availableLevel1 = shuffle(availableLevel1, random)
    availableLevel2 = shuffle(availableLevel2, random)
    availableLevel3 = shuffle(availableLevel3, random)

    // Try to fill Level 1 (9 animals) - only check requirements
    for (const animal of availableLevel1) {
      if (board.level1.length >= 9) break
      if (!meetsRequirement(animal, board.level1)) continue
      board.level1.push(animal)
    }

    if (board.level1.length < 9) continue // Try again

    // Try to fill Level 2 (9 animals) - only check requirements
    const selectedForRequirements = [...board.level1]
    for (const animal of availableLevel2) {
      if (board.level2.length >= 9) break
      if (!meetsRequirement(animal, selectedForRequirements)) continue
      board.level2.push(animal)
      selectedForRequirements.push(animal)
    }

    if (board.level2.length < 9) continue // Try again

    // Try to fill Level 3 (5 animals) - only check requirements
    for (const animal of availableLevel3) {
      if (board.level3.length >= 5) break
      if (!meetsRequirement(animal, selectedForRequirements)) continue
      board.level3.push(animal)
      selectedForRequirements.push(animal)
    }

    if (board.level3.length < 5) continue // Try again

    // Add co-species to help meet biome requirements
    const selectedAnimals = [...board.level1, ...board.level2, ...board.level3]
    const biomeCounts = new Map<string, number>()
    
    // Count animals per biome
    selectedAnimals.forEach(animal => {
      const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
      biomes.forEach(biome => {
        biomeCounts.set(biome, (biomeCounts.get(biome) || 0) + 1)
      })
    })

    // Add co-species: at least 1 per biome that has animals (can be small or large)
    const shuffledCoSpecies = shuffle(allCoSpecies, random)
    const coSpeciesByBiome = new Map<string, number>()
    
    // First pass: add at least 1 co-species to each biome that has animals
    const biomesInPlay = Array.from(biomeCounts.keys())
    
    for (const biome of biomesInPlay) {
      // Find a co-species that belongs to this biome and hasn't been added yet
      for (const coSpecies of shuffledCoSpecies) {
        if (board.coSpecies.some(c => c.id === coSpecies.id)) continue // Already added
        
        const smallCount = board.coSpecies.filter(c => c.size === 1).length
        if (coSpecies.size === 1 && smallCount >= 5) continue // Max 5 small co-species
        
        const coSpeciesBiomes = Array.isArray(coSpecies.biome) ? coSpecies.biome : [coSpecies.biome]
        if (coSpeciesBiomes.includes(biome)) {
          board.coSpecies.push(coSpecies)
          coSpeciesByBiome.set(biome, (coSpeciesByBiome.get(biome) || 0) + 1)
          biomeCounts.set(biome, (biomeCounts.get(biome) || 0) + 1)
          break
        }
      }
    }
    
    // Second pass: add more co-species to biomes that need them for viability (strict mode)
    if (strict) {
      for (const coSpecies of shuffledCoSpecies) {
        const smallCount = board.coSpecies.filter(c => c.size === 1).length
        if (coSpecies.size === 1 && smallCount >= 5) continue // Max 5 small co-species
        if (board.coSpecies.some(c => c.id === coSpecies.id)) continue
        
        // Check category limits
        const categories = Array.isArray(coSpecies.category) ? coSpecies.category : [coSpecies.category]
        const wouldExceed = categories.some(cat => {
          const currentCount = countAllByCategory([...selectedAnimals, ...board.coSpecies], cat)
          return currentCount >= 4  // Allow up to 4
        })
        if (wouldExceed) continue
        
        const coSpeciesBiomes = Array.isArray(coSpecies.biome) ? coSpecies.biome : [coSpecies.biome]
        
        for (const biome of coSpeciesBiomes) {
          const currentCoCount = coSpeciesByBiome.get(biome) || 0
          if (currentCoCount >= 2) continue // Max 2 per biome
          
          const animalCount = biomeCounts.get(biome) || 0
          if (animalCount < 3) { // Biome needs more animals
            board.coSpecies.push(coSpecies)
            coSpeciesByBiome.set(biome, currentCoCount + 1)
            biomeCounts.set(biome, animalCount + 1)
            break
          }
        }
      }
    }

    // Validate the board
    const validation = validateBoard(board)
    if (validation.valid) {
      if (attempt === 0 || attempt % 50 === 0) {
        console.log(`Attempt ${attempt}: Generated board with ${validation.warnings.length} warnings`)
      }
      return board
    }
  }
  
  console.log(`Failed to generate valid board after ${maxAttempts} attempts`)

  return null // Could not generate valid board
}

