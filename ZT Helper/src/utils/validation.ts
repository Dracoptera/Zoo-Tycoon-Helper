import type { Animal } from '../animals'
import type { CoSpecies } from '../co-species'
import { categories, biomes, Category, Biome } from '../constants'

export type SelectedBoard = {
  level1: Animal[]
  level2: Animal[]
  level3: Animal[]
  coSpecies: CoSpecies[]
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Check if a category is an array
const isCategoryArray = (cat: Category | Category[]): cat is Category[] => {
  return Array.isArray(cat)
}

const isBiomeArray = (b: Biome | Biome[]): b is Biome[] => {
  return Array.isArray(b)
}

// Count animals by category
const countByCategory = (animals: Animal[], category: Category): number => {
  return animals.filter(animal => {
    if (isCategoryArray(animal.category)) {
      return animal.category.includes(category)
    }
    return animal.category === category
  }).length
}

// Count animals by biome
const countByBiome = (animals: Animal[], coSpecies: CoSpecies[], biome: Biome): number => {
  const fromAnimals = animals.filter(animal => {
    if (isBiomeArray(animal.biome)) {
      return animal.biome.includes(biome)
    }
    return animal.biome === biome
  }).length

  const fromCoSpecies = coSpecies.filter(species => {
    if (isBiomeArray(species.biome)) {
      return species.biome.includes(biome)
    }
    return species.biome === biome
  }).length

  return fromAnimals + fromCoSpecies
}

// Check if an animal's requirement is satisfied
const isRequirementSatisfied = (
  board: SelectedBoard,
  requirement: { count: number; category: Category | Category[] }
): boolean => {
  const allAnimals = [...board.level1, ...board.level2, ...board.level3, ...board.coSpecies]
  
  if (isCategoryArray(requirement.category)) {
    // Multiple categories allowed
    const total = requirement.category.reduce((sum, cat) => {
      return sum + allAnimals.filter(animal => {
        if (isCategoryArray(animal.category)) {
          return animal.category.includes(cat)
        }
        return animal.category === cat
      }).length
    }, 0)
    return total >= requirement.count
  } else {
    // Single category
    return countByCategory(allAnimals, requirement.category) >= requirement.count
  }
}

export function validateBoard(board: SelectedBoard): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  }

  // Check counts
  if (board.level1.length !== 9) {
    result.valid = false
    result.errors.push(`Level 1 must have exactly 9 animals (currently ${board.level1.length})`)
  }
  if (board.level2.length !== 9) {
    result.valid = false
    result.errors.push(`Level 2 must have exactly 9 animals (currently ${board.level2.length})`)
  }
  if (board.level3.length !== 5) {
    result.valid = false
    result.errors.push(`Level 3 must have exactly 5 animals (currently ${board.level3.length})`)
  }

  // Check co-species limits
  const smallCoSpecies = board.coSpecies.filter(c => c.size === 1).length
  if (smallCoSpecies > 5) {
    result.valid = false
    result.errors.push(`Small co-species limit exceeded: ${smallCoSpecies}/5`)
  }

  // Check co-species per biome (max 2 per biome)
  const coSpeciesByBiome = new Map<Biome, number>()
  board.coSpecies.forEach(species => {
    const biomes = isBiomeArray(species.biome) ? species.biome : [species.biome]
    biomes.forEach(b => {
      coSpeciesByBiome.set(b, (coSpeciesByBiome.get(b) || 0) + 1)
    })
  })
  
  coSpeciesByBiome.forEach((count, biome) => {
    if (count > 2) {
      result.valid = false
      result.errors.push(`Co-species limit exceeded for ${biome}: ${count}/2`)
    }
  })

  // Check biome requirement (3 or more species per biome)
  const allAnimals = [...board.level1, ...board.level2, ...board.level3, ...board.coSpecies]
  Object.values(biomes).forEach(biome => {
    const count = countByBiome(board.level1, board.coSpecies, biome)
    if (count > 0 && count < 3) {
      result.warnings.push(`${biome} has ${count} species (needs at least 3 to be viable)`)
    }
  })

  // Check category requirements
  const allAnimalsForReq = [...board.level1, ...board.level2, ...board.level3]
  allAnimalsForReq.forEach(animal => {
    if (animal.requirement) {
      const satisfied = isRequirementSatisfied(allAnimalsForReq, animal.requirement)
      if (!satisfied) {
        result.valid = false
        const reqCategories = isCategoryArray(animal.requirement.category) 
          ? animal.requirement.category.join(' or ')
          : animal.requirement.category
        result.errors.push(`${animal.name} requires ${animal.requirement.count} ${reqCategories}s`)
      }
    }
  })

  // Check popularity locks
  const lockedAnimals = allAnimalsForReq.filter(a => a.isPopularityLocked)
  if (lockedAnimals.length > 0) {
    result.warnings.push(`${lockedAnimals.length} animal(s) are locked behind popularity requirement (15+ points)`)
  }

  return result
}

// Get available animals that can be selected (not already selected)
export function getAvailableAnimals(
  allAnimals: Animal[],
  level: 1 | 2 | 3,
  selectedIds: string[]
): Animal[] {
  return allAnimals
    .filter(a => a.level === level)
    .filter(a => !selectedIds.includes(a.id))
}

// Get available co-species
export function getAvailableCoSpecies(
  allCoSpecies: CoSpecies[],
  selectedIds: string[]
): CoSpecies[] {
  return allCoSpecies.filter(c => !selectedIds.includes(c.id))
}

