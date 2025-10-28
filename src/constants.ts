export const categories = {
  CARNIVORE: "Carnivore",
  UNGULATE: "Ungulate",
  BIRD: "Bird",
  XENARTHRAN: "Xenarthran",
  MARSUPIAL: "Marsupial",
  PRIMATE: "Primate",
  REPTILE: "Reptile",
  INVERTEBRATE: "Invertebrate",
  AMPHIBIAN: "Amphibian",
  AQUATIC: "Aquatic",
  FISH: "Fish"
} as const;

export const biomes = {
  TUNDRA_STEPPE: "Tundra & Steppe",
  MONTANE_FOREST: "Montane Forest",
  RAINFOREST: "Rainforest",
  SAVANNAH: "Savannah",
  DRY_FOREST: "Dry Forest",
  WATER: "Water"
} as const;

export type Category = typeof categories[keyof typeof categories];
export type Biome = typeof biomes[keyof typeof biomes];


