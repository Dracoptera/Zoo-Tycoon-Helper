import { categories, biomes, Category, Biome } from "./constants";

interface LevelValues {
  level1: number | null;
  level2: number | null;
  level3: number | null;
}

interface GroupSizeLevelValues {
  level1: number | string | null;
  level2: number | string | null;
  level3: number | string | null;
}

export interface Animal {
  id: string;
  name: string;
  category: Category;
  biome: Biome | Biome[];
  level: number;
  basePopularityValue: number;
  educationValue: number;
  conservationValue: number | null;
  costPerTile: number;
  maxPerTile: number;
  experience: LevelValues;
  freeSpace: LevelValues;
  shelters: LevelValues;
  groupSize: GroupSizeLevelValues;
  requirement?: {
    count: number;
    category: Category;
  };
}

export default {
  animals: [
    {
      "id": "american-black-bear",
      "name": "American Black Bear",
      "category": categories.CARNIVORE,
      "biome": biomes.MONTANE_FOREST,
      "level": 1,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 1,
        "level2": null,
        "level3": 2
      }
    },
    {
      "id": "puma",
      "name": "Puma",
      "category": categories.CARNIVORE,
      "biome": [biomes.TUNDRA_STEPPE, biomes.MONTANE_FOREST, biomes.RAINFOREST, biomes.DRY_FOREST],
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "arctic-fox",
      "name": "Arctic Fox",
      "category": categories.CARNIVORE,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 1,
      "basePopularityValue": 1,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 4,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": null,
        "level3": "2+"
      }
    },
    {
      "id": "snowy-owl",
      "name": "Snowy Owl",
      "category": categories.BIRD,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "jaguar",
      "name": "Jaguar",
      "category": categories.CARNIVORE,
      "biome": [biomes.DRY_FOREST, biomes.RAINFOREST],
      "level": 1,
      "basePopularityValue": 4,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 1,
        "level2": null,
        "level3": 2
      }
    },

    {
      "id": "saltwater-crocodile",
      "name": "Saltwater Crocodile",
      "category": categories.REPTILE,
      "biome": biomes.RAINFOREST,
      "level": 1,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    
    {
      "id": "platypus",
      "name": "Platypus",
      "category": categories.AQUATIC,
      "biome": biomes.RAINFOREST,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "giraffe",
      "name": "Giraffe",
      "category": categories.UNGULATE,
      "biome": biomes.SAVANNAH,
      "level": 1,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": 3
      }
    },
    {
      "id": "eastern-grey-kangaroo",
      "name": "Eastern Grey Kangaroo",
      "category": categories.MARSUPIAL,
      "biome": biomes.DRY_FOREST,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 2,
        "level2": 4,
        "level3": "5+"
      }
    },
    {
      "id": "red-and-green-macaw",
      "name": "Red-and-Green Macaw",
      "category": categories.BIRD,
      "biome": biomes.RAINFOREST,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 2,
        "level2": 3,
        "level3": "5+"
      }
    },
    {
      "id": "common-raccoon",
      "name": "Common Raccoon",
      "category": categories.CARNIVORE,
      "biome": biomes.MONTANE_FOREST,
      "level": 1,
      "basePopularityValue": 1,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": 0,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "6+"
      }
    },
    {
      "id": "wolf",
      "name": "Wolf",
      "category": categories.CARNIVORE,
      "biome": [biomes.MONTANE_FOREST, biomes.DRY_FOREST, biomes.TUNDRA_STEPPE],
      "level": 1,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "6+"
      }
    },
    {
      "id": "lion",
      "name": "Lion",
      "category": categories.CARNIVORE,
      "biome": biomes.SAVANNAH,
      "level": 1,
      "basePopularityValue": 5,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 3,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 2,
        "level2": null,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 3,
        "level2": 5,
        "level3": "6+"
      }
    },
    {
      "id": "plains-zebra",
      "name": "Plains Zebra",
      "category": categories.UNGULATE,
      "biome": biomes.SAVANNAH,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": 1,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": 1,
        "level2": null,
        "level3": 2
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "6+"
      }
    },
    {
      "id": "muskox",
      "name": "Muskox",
      "category": categories.UNGULATE,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 2,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "6+"
      }
    },
    {
      "id": "common-ostrich",
      "name": "Common Ostrich",
      "category": categories.BIRD,
      "biome": biomes.SAVANNAH,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 2,
        "level2": 4,
        "level3": "7+"
      }
    },
    {
      "id": "wapiti",
      "name": "Wapiti/Elk",
      "category": categories.UNGULATE,
      "biome": biomes.MONTANE_FOREST,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "9+"
      }
    },
    {
      "id": "capybara",
      "name": "Capybara",
      "category": categories.UNGULATE,
      "biome": biomes.RAINFOREST,
      "level": 1,
      "basePopularityValue": 1,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 2,
        "level2": 4,
        "level3": "9+"
      }
    },
    {
      "id": "tufted-capuchin",
      "name": "Tufted Capuchin",
      "category": categories.PRIMATE,
      "biome": biomes.RAINFOREST,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": 0,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "9+"
      }
    },
    {
      "id": "california-sea-lion",
      "name": "California Sea Lion",
      "category": [categories.AQUATIC, categories.CARNIVORE],
      "biome": biomes.WATER,
      "level": 1,
      "basePopularityValue": 3,
      "educationValue": 4,
      "conservationValue": null,
      "costPerTile": null,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 4,
        "level2": 7,
        "level3": "12+"
      }
    },
    {
      "id": "magellanic-penguin",
      "name": "Magellanic Penguin",
      "category": categories.BIRD,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 1,
      "basePopularityValue": 2,
      "educationValue": 3,
      "conservationValue": null,
      "costPerTile": 1,
      "maxPerTile": 4,
      "experience": {
        "level1": 1,
        "level2": 2,
        "level3": 4
      },
      "freeSpace": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "12+"
      }
    },
    {
      "id": "snow-leopard",
      "name": "Snow Leopard",
      "category": categories.CARNIVORE,
      "biome": biomes.MONTANE_FOREST,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 1,
      "costPerTile": 4,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 3,
        "level3": 4
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "red-panda",
      "name": "Red Panda",
      "category": categories.CARNIVORE,
      "biome": biomes.MONTANE_FOREST,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "polar-bear",
      "name": "Polar Bear",
      "category": categories.CARNIVORE,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 2,
      "basePopularityValue": 5,
      "educationValue": 3,
      "conservationValue": 1,
      "costPerTile": 5,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 4,
        "level3": 5
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "black-rhinoceros",
      "name": "Black Rhinoceros",
      "category": categories.UNGULATE,
      "biome": biomes.SAVANNAH,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": 3,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "komodo-dragon",
      "name": "Komodo Dragon",
      "category": categories.REPTILE,
      "biome": biomes.DRY_FOREST,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "cheetah",
      "name": "Cheetah",
      "category": categories.CARNIVORE,
      "biome": biomes.SAVANNAH,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 1,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 3
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": "2+"
      }
    },
    {
      "id": "southern-cassowary",
      "name": "Southern Cassowary",
      "category": categories.BIRD,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "south-american-tapir",
      "name": "South American Tapir",
      "category": categories.UNGULATE,
      "biome": [biomes.RAINFOREST, biomes.DRY_FOREST],
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 1,
      "costPerTile": 1,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "okapi",
      "name": "Okapi",
      "category": categories.UNGULATE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "tiger",
      "name": "Tiger",
      "category": categories.CARNIVORE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 4,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 3,
        "level3": 4
      },
      "shelters": {
        "level1": null,
        "level2": null,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      }
    },
    {
      "id": "african-manatee",
      "name": "Manatee",
      "category": categories.AQUATIC,
      "biome": biomes.WATER,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 1,
      "costPerTile": null,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "3+"
      }
    },
    {
      "id": "koala",
      "name": "Koala",
      "category": categories.MARSUPIAL,
      "biome": biomes.DRY_FOREST,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "3+"
      }
    },
    {
      "id": "galapagos-tortoise",
      "name": "Galápagos Tortoise",
      "category": categories.REPTILE,
      "biome": biomes.DRY_FOREST,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 1,
      "conservationValue": 2,
      "costPerTile": 3,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "3+"
      }
    },
    {
      "id": "sea-otter",
      "name": "Sea Otter",
      "category": [categories.CARNIVORE, categories.AQUATIC],
      "biome": biomes.WATER,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": 2,
      "costPerTile": null,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 3
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "4+"
      }
    },
    {
      "id": "walrus",
      "name": "Walrus",
      "category": [categories.CARNIVORE, categories.AQUATIC],
      "biome": biomes.WATER,
      "level": 2,
      "basePopularityValue": 3,
      "educationValue": 3,
      "conservationValue": 1,
      "costPerTile": null,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 3,
        "level3": "4+"
      }
    },
    {
      "id": "hippopotamus",
      "name": "Hippopotamus",
      "category": categories.UNGULATE,
      "biome": [biomes.RAINFOREST, biomes.SAVANNAH],
      "level": 2,
      "basePopularityValue": 4,
      "educationValue": 3,
      "conservationValue": 1,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 2,
        "level3": "4+"
      }
    },
    {
      "id": "asian-elephant",
      "name": "Asian Elephant",
      "category": categories.UNGULATE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 7,
      "educationValue": 4,
      "conservationValue": 2,
      "costPerTile": 3,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "5+"
      }
    },
    {
      "id": "spotted-eagle-ray",
      "name": "Spotted Eagle Ray",
      "category": [categories.AQUATIC, categories.FISH],
      "biome": biomes.WATER,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": null,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": null,
        "level2": 3,
        "level3": "6+"
      }
    },
    {
      "id": "western-gorilla",
      "name": "Western Gorilla",
      "category": categories.PRIMATE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 4,
      "educationValue": 4,
      "conservationValue": 3,
      "costPerTile": 3,
      "maxPerTile": 2,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 3,
        "level2": 4,
        "level3": "6+"
      }
    },
    {
      "id": "ring-tailed-lemur",
      "name": "Ring-Tailed Lemur",
      "category": categories.PRIMATE,
      "biome": biomes.DRY_FOREST,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 4,
      "conservationValue": 2,
      "costPerTile": 2,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "8+"
      }
    },
    {
      "id": "red-ruffed-lemur",
      "name": "Red-Ruffed Lemur",
      "category": categories.PRIMATE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 3,
      "conservationValue": 3,
      "costPerTile": 2,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "8+"
      }
    },
    {
      "id": "atlantic-puffin",
      "name": "Atlantic Puffin",
      "category": categories.BIRD,
      "biome": biomes.TUNDRA_STEPPE,
      "level": 2,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 1,
      "costPerTile": 1,
      "maxPerTile": 4,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "9+"
      }
    },
    {
      "id": "chacoan-peccary",
      "name": "Chacoan Peccary",
      "category": categories.UNGULATE,
      "biome": biomes.DRY_FOREST,
      "level": 2,
      "basePopularityValue": 1,
      "educationValue": 2,
      "conservationValue": 2,
      "costPerTile": 1,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": null,
        "level3": 2
      },
      "shelters": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 2,
        "level2": 3,
        "level3": "9+"
      }
    },
    {
      "id": "chimpanzee",
      "name": "Chimpanzee",
      "category": categories.PRIMATE,
      "biome": biomes.RAINFOREST,
      "level": 2,
      "basePopularityValue": 4,
      "educationValue": 4,
      "conservationValue": 2,
      "costPerTile": 3,
      "maxPerTile": 3,
      "experience": {
        "level1": 1,
        "level2": 4,
        "level3": 6
      },
      "freeSpace": {
        "level1": 1,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "groupSize": {
        "level1": 4,
        "level2": 5,
        "level3": "9+"
      }
    },
    {
      "id": "bearded-vulture",
      "name": "Bearded Vulture",
      "category": categories.BIRD,
      "biome": biomes.MONTANE_FOREST,
      "level": 3,
      "basePopularityValue": 2,
      "educationValue": 2,
      "conservationValue": 3,
      "costPerTile": 2,
      "maxPerTile": 1,
      "experience": {
        "level1": 1,
        "level2": 3,
        "level3": 5
      },
      "freeSpace": {
        "level1": null,
        "level2": 2,
        "level3": 3
      },
      "shelters": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "groupSize": {
        "level1": null,
        "level2": 1,
        "level3": 2
      },
      "requirement": {
        "count": 3,
        "category": categories.BIRD
      }
    },
  ]
};