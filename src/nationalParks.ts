import type { Biome } from './constants'

export type NationalPark = {
  id: string
  name: string
  game: 'base' | 'expansion'
  biome: Biome
  requiredAnimals: string[] // animal IDs
  optionalAnimals?: string[][] // alternative animals (OR condition)
}

export const nationalParks: NationalPark[] = [
  {
    id: 'pantanal',
    name: 'Pantanal Matogrossense',
    game: 'base',
    biome: 'Rainforest',
    requiredAnimals: [
      'red-and-green-macaw',
      'tufted-capuchin',
      'giant-anteater',
      'jabiru'
    ]
  },
  {
    id: 'banff',
    name: 'Banff',
    game: 'base',
    biome: 'Montane Forest',
    requiredAnimals: [
      'american-black-bear',
      'wapiti',
      'common-raccoon',
      'striped-skunk'
    ]
  },
  {
    id: 'serengeti',
    name: 'Serengeti National Park',
    game: 'base',
    biome: 'Savannah',
    requiredAnimals: [
      'lion',
      'blue-wildebeest',
      'fischers-lovebird'
    ],
    optionalAnimals: [
      ['common-ostrich', 'plains-zebra'],
      ['giraffe', 'black-rhinoceros']
    ]
  },
  {
    id: 'ramganga',
    name: 'Ramganga National Park',
    game: 'base',
    biome: 'Rainforest',
    requiredAnimals: [
      'asian-elephant',
      'tiger',
      'axis-deer',
      'great-hornbill'
    ]
  },
  {
    id: 'wolong',
    name: 'Wolong National Park',
    game: 'base',
    biome: 'Montane Forest',
    requiredAnimals: [
      'giant-panda',
      'red-panda',
      'snow-leopard',
      'bearded-vulture'
    ]
  }
  ,
  {
    id: 'punta-tombo',
    name: 'Punta Tombo',
    game: 'expansion',
    biome: 'Tundra & Steppe',
    requiredAnimals: [
      'puma',
      'magellanic-penguin'
    ],
    optionalAnimals: [
      ['guanaco', 'nandu']
    ]
  },
  {
    id: 'northeast-greenland',
    name: 'Northeast Greenland National Park',
    game: 'expansion',
    biome: 'Tundra & Steppe',
    requiredAnimals: [
      'polar-bear',
      'muskox',
      'arctic-fox'
    ]
  },
  {
    id: 'kaa-iya',
    name: 'Parque Nacional y Área Natural de Manejo Integrado Kaa Iya del Gran Chaco',
    game: 'expansion',
    biome: 'Dry Forest',
    requiredAnimals: [
      'chacoan-peccary',
      'giant-anteater',
      'six-banded-armadillo'
    ],
    optionalAnimals: [
      ['jaguar', 'puma'],
      ['south-american-tapir', 'capybara']
    ]
  },
  {
    id: 'conkouati-douli',
    name: 'Parc National de Conkouati-Douli',
    game: 'expansion',
    biome: 'Rainforest',
    requiredAnimals: [
      'hippopotamus',
      'african-manatee',
      'green-sea-turtle',
      'greater-flamingo',
      'red-river-hog'
    ]
  },
  {
    id: 'wet-tropics-queensland',
    name: 'Wet Tropics of Queensland',
    game: 'expansion',
    biome: 'Dry Forest',
    requiredAnimals: [
      'eastern-grey-kangaroo',
      'koala',
      'southern-cassowary',
      'saltwater-crocodile',
      'emu'
    ]
  }
]

export function checkNationalParkStatus(
  park: NationalPark,
  boardAnimalIds: Set<string>,
  boardCoSpeciesIds: Set<string>
): { complete: boolean; missing: string[]; hasOptional: boolean[] } {
  const allBoardIds = new Set([...boardAnimalIds, ...boardCoSpeciesIds])
  
  // Check required animals
  const missing: string[] = []
  park.requiredAnimals.forEach(animalId => {
    if (!allBoardIds.has(animalId)) {
      missing.push(animalId)
    }
  })
  
  // Check optional animals (OR conditions)
  const hasOptional: boolean[] = []
  if (park.optionalAnimals) {
    park.optionalAnimals.forEach(alternatives => {
      const hasAny = alternatives.some(animalId => allBoardIds.has(animalId))
      hasOptional.push(hasAny)
      if (!hasAny) {
        missing.push(`(${alternatives.join(' OR ')})`)
      }
    })
  }
  
  const complete = missing.length === 0
  
  return { complete, missing, hasOptional }
}

export function getNationalParkAnimals(parkId: string): string[] {
  const park = nationalParks.find(p => p.id === parkId)
  if (!park) return []
  
  const animals = [...park.requiredAnimals]
  
  // For optional animals, include the first option
  if (park.optionalAnimals) {
    park.optionalAnimals.forEach(alternatives => {
      animals.push(alternatives[0])
    })
  }
  
  return animals
}

