import { categories, biomes, Category, Biome } from "./constants";

export interface CoSpecies {
  id: string;
  name: string;
  size: 1 | 2;
  biome: Biome | Biome[];
  category: Category | Category[];
}

export default {
  coSpecies: [
    {
      "id": "scarlet-ibis",
      "name": "Scarlet Ibis",
      "size": 1,
      "biome": biomes.RAINFOREST,
      "category": categories.BIRD
    },
    {
      "id": "red-necked-wallaby",
      "name": "Red-Necked Wallaby",
      "size": 1,
      "biome": biomes.DRY_FOREST,
      "category": categories.MARSUPIAL
    },
    {
      "id": "six-banded-armadillo",
      "name": "Six-Banded Armadillo",
      "size": 1,
      "biome": biomes.DRY_FOREST,
      "category": categories.XENARTHRAN
    },
    {
      "id": "tundra-swan",
      "name": "Tundra Swan",
      "size": 1,
      "biome": [biomes.TUNDRA_STEPPE, biomes.MONTANE_FOREST],
      "category": categories.BIRD
    },
    {
      "id": "grey-crowned-crane",
      "name": "Grey-crowned Crane",
      "size": 1,
      "biome": biomes.SAVANNAH,
      "category": categories.BIRD
    },
    {
      "id": "jabiru",
      "name": "Jabiru",
      "size": 1,
      "biome": biomes.RAINFOREST,
      "category": categories.BIRD
    },
    {
      "id": "fischers-lovebird",
      "name": "Fischer's Lovebird",
      "size": 1,
      "biome": biomes.SAVANNAH,
      "category": categories.BIRD
    },
    {
      "id": "meerkat",
      "name": "Meerkat",
      "size": 1,
      "biome": biomes.SAVANNAH,
      "category": categories.CARNIVORE
    },
    {
      "id": "striped-skunk",
      "name": "Striped Skunk",
      "size": 1,
      "biome": biomes.MONTANE_FOREST,
      "category": categories.CARNIVORE
    },
    {
      "id": "red-river-hog",
      "name": "Red River Hog",
      "size": 2,
      "biome": biomes.RAINFOREST,
      "category": categories.UNGULATE
    },
    {
      "id": "greater-flamingo",
      "name": "Greater Flamingo",
      "size": 2,
      "biome": biomes.RAINFOREST,
      "category": categories.BIRD
    },
    {
      "id": "giant-anteater",
      "name": "Giant Anteater",
      "size": 2,
      "biome": [biomes.RAINFOREST, biomes.DRY_FOREST],
      "category": categories.XENARTHRAN
    },
    {
      "id": "emu",
      "name": "Emu",
      "size": 2,
      "biome": biomes.DRY_FOREST,
      "category": categories.BIRD
    },
    {
      "id": "white-nosed-coati",
      "name": "White-Nosed Coati",
      "size": 2,
      "biome": [biomes.DRY_FOREST, biomes.RAINFOREST],
      "category": categories.CARNIVORE
    },
    {
      "id": "nandu",
      "name": "Ñandú",
      "size": 2,
      "biome": biomes.TUNDRA_STEPPE,
      "category": categories.BIRD
    },
    {
      "id": "guanaco",
      "name": "Guanaco",
      "size": 2,
      "biome": biomes.TUNDRA_STEPPE,
      "category": categories.UNGULATE
    },
    {
      "id": "siberian-crane",
      "name": "Siberian Crane",
      "size": 2,
      "biome": biomes.TUNDRA_STEPPE,
      "category": categories.BIRD
    },
    {
      "id": "great-hornbill",
      "name": "Great Hornbill",
      "size": 2,
      "biome": biomes.RAINFOREST,
      "category": categories.BIRD
    },
    {
      "id": "axis-deer",
      "name": "Axis Deer",
      "size": 2,
      "biome": biomes.RAINFOREST,
      "category": categories.UNGULATE
    },
    {
      "id": "blue-wildebeest",
      "name": "Blue Wildebeest",
      "size": 2,
      "biome": biomes.SAVANNAH,
      "category": categories.UNGULATE
    },
    {
      "id": "dama-gazelle",
      "name": "Dama Gazelle",
      "size": 2,
      "biome": biomes.SAVANNAH,
      "category": categories.UNGULATE
    },
    {
      "id": "eurasian-otter",
      "name": "Eurasian Otter",
      "size": 2,
      "biome": biomes.MONTANE_FOREST,
      "category": categories.CARNIVORE
    },
    {
      "id": "west-caucasian-tur",
      "name": "West Caucasian Tur",
      "size": 2,
      "biome": biomes.MONTANE_FOREST,
      "category": categories.UNGULATE
    }
  ]
};

