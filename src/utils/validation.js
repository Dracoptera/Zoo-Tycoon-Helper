import { biomes } from '../constants';
// Check if a category is an array
const isCategoryArray = (cat) => {
    return Array.isArray(cat);
};
const isBiomeArray = (b) => {
    return Array.isArray(b);
};
// Count animals by category
const countByCategory = (animals, category) => {
    return animals.filter(animal => {
        if (isCategoryArray(animal.category)) {
            return animal.category.includes(category);
        }
        return animal.category === category;
    }).length;
};
// Get the deterministically assigned biome for an animal (same logic as display)
function getAssignedBiome(item, biomeAssignments) {
    const biomes = Array.isArray(item.biome) ? item.biome : [item.biome];
    if (biomes.length === 1)
        return biomes[0];
    // Use stored assignment if available
    if (biomeAssignments?.has(item.id)) {
        return biomeAssignments.get(item.id);
    }
    // Fallback to deterministic selection
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const biomeIndex = hash % biomes.length;
    return biomes[biomeIndex];
}
// Count animals by biome (using deterministic assignment)
const countByBiome = (animals, coSpecies, biome, biomeAssignments) => {
    const fromAnimals = animals.filter(animal => getAssignedBiome(animal, biomeAssignments) === biome).length;
    const fromCoSpecies = coSpecies.filter(species => getAssignedBiome(species, biomeAssignments) === biome).length;
    return fromAnimals + fromCoSpecies;
};
// Check if an animal's requirement is satisfied
const isRequirementSatisfied = (animals, requirement) => {
    if (isCategoryArray(requirement.category)) {
        // Multiple categories allowed
        const total = requirement.category.reduce((sum, cat) => {
            return sum + animals.filter(animal => {
                if (isCategoryArray(animal.category)) {
                    return animal.category.includes(cat);
                }
                return animal.category === cat;
            }).length;
        }, 0);
        return total >= requirement.count;
    }
    else {
        // Single category
        return countByCategory(animals, requirement.category) >= requirement.count;
    }
};
export function validateBoard(board, availableCoSpecies) {
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    // Check counts
    if (board.level1.length !== 9) {
        result.valid = false;
        result.errors.push(`Level 1 must have exactly 9 animals (currently ${board.level1.length})`);
    }
    if (board.level2.length !== 10) {
        result.valid = false;
        result.errors.push(`Level 2 must have exactly 10 animals (currently ${board.level2.length})`);
    }
    if (board.level3.length !== 5) {
        result.valid = false;
        result.errors.push(`Level 3 must have exactly 5 animals (currently ${board.level3.length})`);
    }
    // Check co-species limits
    const smallCoSpecies = board.coSpecies.filter(c => c.size === 1).length;
    if (smallCoSpecies > 5) {
        result.valid = false;
        result.errors.push(`Small co-species limit exceeded: ${smallCoSpecies}/5`);
    }
    // Check co-species per biome (max 2 per biome)
    const coSpeciesByBiome = new Map();
    board.coSpecies.forEach(species => {
        const biomes = isBiomeArray(species.biome) ? species.biome : [species.biome];
        biomes.forEach((b) => {
            coSpeciesByBiome.set(b, (coSpeciesByBiome.get(b) || 0) + 1);
        });
    });
    coSpeciesByBiome.forEach((count, biome) => {
        if (count > 2) {
            result.valid = false;
            result.errors.push(`Co-species limit exceeded for ${biome}: ${count}/2`);
        }
    });
    // Check biome requirement (3 or more species per biome)
    Object.values(biomes).forEach((biome) => {
        const allAnimalsForBiome = [...board.level1, ...board.level2, ...board.level3];
        const count = countByBiome(allAnimalsForBiome, board.coSpecies, biome, board.biomeAssignments);
        if (count > 0 && count < 3) {
            result.warnings.push(`${biome} has ${count} species (needs at least 3 to be viable)`);
        }
    });
    // Removed: Level I biome distribution validation
    // This rule is too strict and causes false warnings with the current random biome assignment system
    // Check that each biome with animals has at least 1 co-species (if co-species exist for that biome)
    const biomesWithAnimals = new Set();
    const allAnimalsList = [...board.level1, ...board.level2, ...board.level3];
    allAnimalsList.forEach((animal) => {
        const biomes = isBiomeArray(animal.biome) ? animal.biome : [animal.biome];
        biomes.forEach((biome) => biomesWithAnimals.add(biome));
    });
    const biomesWithCoSpecies = new Set();
    board.coSpecies.forEach((species) => {
        const biomes = isBiomeArray(species.biome) ? species.biome : [species.biome];
        biomes.forEach((biome) => biomesWithCoSpecies.add(biome));
    });
    // Get biomes that have co-species available (if availableCoSpecies was provided)
    const biomesWithCoSpeciesAvailable = new Set();
    if (availableCoSpecies) {
        availableCoSpecies.forEach((species) => {
            const biomes = isBiomeArray(species.biome) ? species.biome : [species.biome];
            biomes.forEach((biome) => biomesWithCoSpeciesAvailable.add(biome));
        });
    }
    biomesWithAnimals.forEach((biome) => {
        if (!biomesWithCoSpecies.has(biome)) {
            // Only require co-species if they're available for this biome
            // If availableCoSpecies is provided, only require if that biome has co-species available
            if (availableCoSpecies) {
                if (biomesWithCoSpeciesAvailable.has(biome)) {
                    result.valid = false;
                    result.errors.push(`${biome} has animals but no co-species (needs at least 1 co-species per biome)`);
                }
            }
            else {
                // If we don't know which biomes have co-species, always require (to be safe)
                result.valid = false;
                result.errors.push(`${biome} has animals but no co-species (needs at least 1 co-species per biome)`);
            }
        }
    });
    // Check category requirements
    const allAnimalsForReq = [...board.level1, ...board.level2, ...board.level3];
    allAnimalsForReq.forEach(animal => {
        if (animal.requirement) {
            // Include co-species when checking requirements since they also have categories
            const allWithCategories = [...allAnimalsForReq, ...board.coSpecies];
            const satisfied = isRequirementSatisfied(allWithCategories, animal.requirement);
            if (!satisfied) {
                result.valid = false;
                const reqCategories = isCategoryArray(animal.requirement.category)
                    ? animal.requirement.category.join(' or ')
                    : animal.requirement.category;
                result.errors.push(`${animal.name} requires ${animal.requirement.count} ${reqCategories}s`);
            }
        }
    });
    // Check popularity locks
    const lockedAnimals = allAnimalsForReq.filter(a => a.isPopularityLocked);
    if (lockedAnimals.length > 0) {
        result.warnings.push(`${lockedAnimals.length} animal(s) are locked behind popularity requirement (15+ points)`);
    }
    // Removed: Category count validation - no longer enforcing 2-8 species per category
    return result;
}
// Get available animals that can be selected (not already selected)
export function getAvailableAnimals(allAnimals, level, selectedIds) {
    return allAnimals
        .filter(a => a.level === level)
        .filter(a => !selectedIds.includes(a.id));
}
// Get available co-species
export function getAvailableCoSpecies(allCoSpecies, selectedIds) {
    return allCoSpecies.filter(c => !selectedIds.includes(c.id));
}
