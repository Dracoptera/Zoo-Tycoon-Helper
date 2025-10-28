import type { SelectedBoard } from './utils/validation'

export type SampleBoard = {
  name: string
  description?: string
  board: SelectedBoard
}

export const sampleBoards: SampleBoard[] = [
  {
    name: 'Base Game',
    description: 'Official sample board from the base game',
    board: {
      level1: [
        'red-and-green-macaw',
        'tufted-capuchin',
        'common-ostrich',
        'plains-zebra',
        'giraffe',
        'lion',
        'common-raccoon',
        'american-black-bear',
        'wapiti'
      ] as any,
      level2: [
        'red-ruffed-lemur',
        'chimpanzee',
        'western-gorilla',
        'tiger',
        'asian-elephant',
        'black-rhinoceros',
        'red-panda',
        'snow-leopard',
        'giant-panda'
      ] as any,
      level3: [
        'golden-lion-tamarin',
        'bornean-orangutan',
        'northern-bald-ibis',
        'arabian-oryx',
        'bearded-vulture'
      ] as any,
      coSpecies: [
        'jabiru',
        'great-hornbill',
        'giant-anteater',
        'axis-deer',
        'fischers-lovebird',
        'meerkat',
        'blue-wildebeest',
        'dama-gazelle',
        'tundra-swan',
        'striped-skunk',
        'eurasian-otter',
        'west-caucasian-tur'
      ] as any
    }
  },
  {
    name: 'Expansion Board',
    description: 'Official sample board from the expansion',
    board: {
      level1: [
        'capybara',
        'jaguar',
        'saltwater-crocodile',
        'eastern-grey-kangaroo',
        'puma',
        'magellanic-penguin',
        'arctic-fox',
        'muskox',
        'california-sea-lion'
      ] as any,
      level2: [
        'southern-cassowary',
        'south-american-tapir',
        'hippopotamus',
        'chacoan-peccary',
        'komodo-dragon',
        'galapagos-tortoise',
        'koala',
        'polar-bear',
        'african-manatee',
        'sea-otter'
      ] as any,
      level3: [
        'madagascar-pochard',
        'black-footed-ferret',
        'przewalskis-horse',
        'green-sea-turtle',
        'zebra-shark'
      ] as any,
      coSpecies: [
        'scarlet-ibis',
        'giant-anteater',
        'greater-flamingo',
        'red-river-hog',
        'red-necked-wallaby',
        'six-banded-armadillo',
        'emu',
        'white-nosed-coati',
        'tundra-swan',
        'nandu',
        'guanaco',
        'siberian-crane'
      ] as any
    }
  }
]

