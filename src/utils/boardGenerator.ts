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
  requiredAnimals?: string[]  // IDs of animals that must be included
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
function countLevel1ByBiome(level1Animals: Animal[], biome: Biome | string): number {
  return level1Animals.filter(animal => {
    const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
    return biomes.includes(biome as Biome)
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
  }).filter(b => !excludeBiomes.includes(b as Biome))

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board: SelectedBoard = {
      level1: [],
      level2: [],
      level3: [],
      coSpecies: []
    }

    // Add required animals if specified
    if (options.requiredAnimals && options.requiredAnimals.length > 0) {
      for (const animalId of options.requiredAnimals) {
        const animal = allAnimals.find(a => a.id === animalId)
        if (animal) {
          if (animal.level === 1 && board.level1.length < 9) board.level1.push(animal)
          else if (animal.level === 2 && board.level2.length < 10) board.level2.push(animal)
          else if (animal.level === 3 && board.level3.length < 5) board.level3.push(animal)
        }
      }
      
      // If required animals don't fit, skip this attempt
      if (options.requiredAnimals.length > 0 && 
          (board.level1.length > 9 || board.level2.length > 10 || board.level3.length > 5)) {
        continue
      }
    }

    // Don't pre-select biomes - let them naturally emerge from selection
    let availableLevel1 = allAnimals.filter(a => a.level === 1)
    let availableLevel2 = allAnimals.filter(a => a.level === 2)
    let availableLevel3 = allAnimals.filter(a => a.level === 3)

    // Remove already-selected required animals from available pool
    if (options.requiredAnimals && options.requiredAnimals.length > 0) {
      availableLevel1 = availableLevel1.filter(a => !options.requiredAnimals!.includes(a.id))
      availableLevel2 = availableLevel2.filter(a => !options.requiredAnimals!.includes(a.id))
      availableLevel3 = availableLevel3.filter(a => !options.requiredAnimals!.includes(a.id))
    }

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

    // Try to fill Level 2 (10 animals) - only check requirements
    const selectedForRequirements = [...board.level1]
    for (const animal of availableLevel2) {
      if (board.level2.length >= 10) break
      if (!meetsRequirement(animal, selectedForRequirements)) continue
      board.level2.push(animal)
      selectedForRequirements.push(animal)
    }

    if (board.level2.length < 10) continue // Try again

    // Try to fill Level 3 (5 animals) - only check requirements
    for (const animal of availableLevel3) {
      if (board.level3.length >= 5) break
      if (!meetsRequirement(animal, selectedForRequirements)) continue
      board.level3.push(animal)
      selectedForRequirements.push(animal)
    }

    if (board.level3.length < 5) continue // Try again

    // Add co-species to help meet biome requirements
    const allSelectedAnimals = [...board.level1, ...board.level2, ...board.level3]
    const biomeCountsMap = new Map<string, number>()
    
    // Count animals per biome (all possible biomes for multi-biome animals)
    allSelectedAnimals.forEach(animal => {
      const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
      biomes.forEach(biome => {
        biomeCountsMap.set(biome, (biomeCountsMap.get(biome) || 0) + 1)
      })
    })

    // Add co-species: at least 1 per biome that has animals (can be small or large)
    const shuffledCoSpecies = shuffle(allCoSpecies, random)
    const coSpeciesByBiome = new Map<string, number>()
    
    // First pass: add at least 1 co-species to each biome that has animals
    const biomesInPlay = Array.from(biomeCountsMap.keys())
    
    for (const biome of biomesInPlay) {
      // Find a co-species that belongs to this biome and hasn't been added yet
      for (const coSpecies of shuffledCoSpecies) {
        if (board.coSpecies.some(c => c.id === coSpecies.id)) continue // Already added
        
        const smallCount = board.coSpecies.filter(c => c.size === 1).length
        if (coSpecies.size === 1 && smallCount >= 5) continue // Max 5 small co-species
        
        const coSpeciesBiomes = Array.isArray(coSpecies.biome) ? coSpecies.biome : [coSpecies.biome]
        if (coSpeciesBiomes.includes(biome as Biome)) {
          board.coSpecies.push(coSpecies)
          coSpeciesByBiome.set(biome, (coSpeciesByBiome.get(biome) || 0) + 1)
          biomeCountsMap.set(biome, (biomeCountsMap.get(biome) || 0) + 1)
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
          const currentCount = countAllByCategory([...allSelectedAnimals, ...board.coSpecies], cat)
          return currentCount >= 4  // Allow up to 4
        })
        if (wouldExceed) continue
        
        const coSpeciesBiomes = Array.isArray(coSpecies.biome) ? coSpecies.biome : [coSpecies.biome]
        
        for (const biome of coSpeciesBiomes) {
          const currentCoCount = coSpeciesByBiome.get(biome) || 0
          if (currentCoCount >= 2) continue // Max 2 per biome
          
          const animalCount = biomeCountsMap.get(biome) || 0
          if (animalCount < 3) { // Biome needs more animals
            board.coSpecies.push(coSpecies)
            coSpeciesByBiome.set(biome, currentCoCount + 1)
            biomeCountsMap.set(biome, animalCount + 1)
            break
          }
        }
      }
    }

    // Intelligently assign multi-biome animals to balance biomes (assign to biome with fewest animals)
    const selectedAnimals = [...board.level1, ...board.level2, ...board.level3]
    const biomeAssignments = new Map<string, string>()
    const biomeCounts = new Map<string, number>()
    const level1ByBiome = new Map<string, number>()
    
    selectedAnimals.forEach(animal => {
      const biomes = Array.isArray(animal.biome) ? animal.biome : [animal.biome]
      let assignedBiome = biomes[0]
      
      // Simple assignment: prefer biomes that need more animals
      if (biomes.length > 1) {
        biomes.forEach(biome => {
          if ((biomeCounts.get(biome) || 0) < (biomeCounts.get(assignedBiome) || 0)) {
            assignedBiome = biome
          }
        })
      }
      
      biomeAssignments.set(animal.id, assignedBiome)
      biomeCounts.set(assignedBiome, (biomeCounts.get(assignedBiome) || 0) + 1)
      if (animal.level === 1) {
        level1ByBiome.set(assignedBiome, (level1ByBiome.get(assignedBiome) || 0) + 1)
      }
    })
    
    // Check if any viable biome (3+ species) is missing Level I
    let hasViableWithoutLevel1 = false
    biomeCounts.forEach((count, biome) => {
      if (count >= 3) {
        const level1Count = level1ByBiome.get(biome) || 0
        if (level1Count === 0) {
          hasViableWithoutLevel1 = true
        }
      }
    })
    
    if (hasViableWithoutLevel1) continue // Try again

    // Store biome assignments in board
    board.biomeAssignments = biomeAssignments

    // Validate the board
    const validation = validateBoard(board)
    if (validation.valid) {
      // Separate critical and non-critical warnings
      const criticalWarnings = validation.warnings.filter(w => 
        w.includes('needs at least 3 to be viable') ||  // Biome viability
        w.includes('no co-species') ||  // Missing co-species
        w.includes('locked behind popularity')  // Popularity locks
      )
      
      // Accept board if no critical warnings, or after 1000 attempts even with some critical warnings
      if (criticalWarnings.length === 0 || (attempt > 1000 && criticalWarnings.length <= 2)) {
        if (attempt === 0 || attempt % 50 === 0 || criticalWarnings.length === 0) {
          console.log(`Attempt ${attempt}: Generated board with ${validation.warnings.length} warnings (${criticalWarnings.length} critical)`)
        }
        return board
      }
    }
  }  // End of for loop
  
  console.log(`Failed to generate valid board after ${maxAttempts} attempts`)

  return null // Could not generate valid board
}

