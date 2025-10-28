import React, { useState } from 'react'
import animalsData from './animals'
import coSpeciesData from './co-species'
import type { Animal } from './animals'
import type { CoSpecies } from './co-species'
import { type SelectedBoard, validateBoard } from './utils/validation'
import { generateBoard } from './utils/boardGenerator'
import { biomes } from './constants'
import type { Biome } from './constants'

// Biome colors
const biomeColors: Record<string, string> = {
  'Tundra & Steppe': '#87CEEB',
  'Montane Forest': '#228B22',
  'Rainforest': '#006400',
  'Savannah': '#DAA520',
  'Dry Forest': '#CD853F',
  'Water': '#4682B4'
}

// Helper function to group animals by biome
// Animals with multiple biomes are randomly assigned to one biome to avoid duplication
function groupAnimalsByBiome<T extends { biome: string | string[], id: string }>(items: T[], biomeAssignments?: Map<string, string>): [string, T[]][] {
  const grouped = new Map<string, T[]>()
  items.forEach(item => {
    const biomes = Array.isArray(item.biome) ? item.biome : [item.biome]
    // Use the assigned biome from the board if available, otherwise use the first biome
    const selectedBiome = biomeAssignments?.get(item.id) || biomes[0]
    if (!grouped.has(selectedBiome)) {
      grouped.set(selectedBiome, [])
    }
    grouped.get(selectedBiome)!.push(item)
  })
  return Array.from(grouped.entries())
}

// Helper component for biome chip
function BiomeChip({ biome }: { biome: string }) {
  const color = biomeColors[biome] || '#95a5a6'
  return (
    <div style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      background: color,
      color: '#fff',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      marginBottom: '10px'
    }}>
      {biome}
    </div>
  )
}

export default function App() {
  const [board, setBoard] = useState<SelectedBoard | null>(null)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateBoard> | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [requiredAnimalIds, setRequiredAnimalIds] = useState<string[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [selectedBiomes, setSelectedBiomes] = useState<Biome[]>([])

  const handleGenerateBalancedBoard = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const allAnimals = animalsData.animals as Animal[]
      const allCoSpecies = coSpeciesData.coSpecies as CoSpecies[]
      const newBoard = generateBoard(allAnimals, allCoSpecies, {
        seed: Date.now(),
        strict: true,
        requiredAnimals: requiredAnimalIds,
        selectedBiomes: selectedBiomes.length > 0 ? selectedBiomes : undefined
      })
      if (newBoard) {
        setBoard(newBoard)
        // Pass available co-species to validation so it knows which biomes have co-species
        const validation = validateBoard(newBoard, allCoSpecies)
        setValidationResult(validation)
      } else {
        const maxAttempts = selectedBiomes.length > 0 && selectedBiomes.length < 6 ? 20000 : 2000
        alert(`Could not generate a balanced board after ${maxAttempts} attempts. Try selecting exactly 4 biomes, more biomes, or fewer required animals.`)
      }
      setIsGenerating(false)
    }, 100)
  }

  const handleExport = () => {
    if (!board) return
    const exportData = {
      level1: board.level1.map(a => a.name).join(', '),
      level2: board.level2.map(a => a.name).join(', '),
      level3: board.level3.map(a => a.name).join(', '),
      coSpecies: board.coSpecies.map(s => s.name).join(', ')
    }
    
    const text = `
Level 1: ${exportData.level1}

Level 2: ${exportData.level2}

Level 3: ${exportData.level3}

Co-Species: ${exportData.coSpecies}
    `.trim()
    
    console.log(text)
    navigator.clipboard.writeText(text).then(() => {
      alert('Board copied to clipboard!')
    }).catch(() => {
      alert('Board logged to console. Check developer tools!')
    })
  }

  return (
    <div className="container">
      <header>
        <h1>🐾 Zoo Tycoon Animal Exchange Board Creator</h1>
        <p className="subtitle">Automatically generates balanced, valid animal selection boards for your game</p>
      </header>

      <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Select Biomes</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
          Choose 4 biomes to focus on, or leave empty to use all biomes.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.values(biomes).map(biome => (
            <label
              key={biome}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                border: `2px solid ${biomeColors[biome]}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedBiomes.includes(biome as Biome) ? biomeColors[biome] : 'transparent',
                color: selectedBiomes.includes(biome as Biome) ? '#fff' : '#333',
                opacity: selectedBiomes.length >= 4 && !selectedBiomes.includes(biome as Biome) ? 0.3 : 1
              }}
            >
              <input
                type="checkbox"
                checked={selectedBiomes.includes(biome as Biome)}
                onChange={() => {
                  if (selectedBiomes.includes(biome as Biome)) {
                    setSelectedBiomes(selectedBiomes.filter(b => b !== biome))
                  } else if (selectedBiomes.length < 4) {
                    setSelectedBiomes([...selectedBiomes, biome as Biome])
                  }
                }}
                disabled={selectedBiomes.length >= 4 && !selectedBiomes.includes(biome as Biome)}
                style={{ marginRight: '8px' }}
              />
              {biome}
            </label>
          ))}
        </div>
        {selectedBiomes.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => setSelectedBiomes([])}
              style={{ 
                background: '#dc3545', 
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px渡航4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              {isFilterExpanded ? '▼' : '▶'}
            </button>
            <h3 style={{ margin: 0 }}>Required Animals</h3>
            {requiredAnimalIds.length > 0 && (
              <span style={{ background: '#2196f3', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                {requiredAnimalIds.length}
              </span>
            )}
          </div>
          {requiredAnimalIds.length > 0 && (
            <button 
              onClick={() => setRequiredAnimalIds([])}
              style={{ 
                background: '#dc3545', 
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear Selected
            </button>
          )}
        </div>
        {isFilterExpanded && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              Select animals that must be included in the board:
            </p>
            <RequiredAnimalsSelector 
              allAnimals={animalsData.animals as Animal[]}
              selectedIds={requiredAnimalIds}
              onSelectionChange={setRequiredAnimalIds}
            />
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          className="primary" 
          onClick={handleGenerateBalancedBoard}
          disabled={isGenerating || (selectedBiomes.length > 0 && selectedBiomes.length !== 4)}
          style={{ 
            fontSize: '1.2rem', 
            padding: '15px 40px', 
            background: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? '#ccc' : '#28a745',
            cursor: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Generating...' : 
           (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? `Please select exactly 4 biomes (${selectedBiomes.length}/4)` : 
           '⚖️ Generate Balanced Board'}
        </button>
      </div>

      {validationResult && (
        <div style={{
          background: validationResult.valid ? '#d4edda' : '#f8d7da',
          border: ` Eusolid ${validationResult.valid ? '#28a745' : '#dc3545'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: validationResult.valid ? '#155724' : '#721c24' }}>
            {validationResult.valid ? '✓ Board is Valid!' : '✗ Board has Errors'}
          </h3>
          {validationResult.errors.length > 0 && (
            <div>
              <strong>Errors:</strong>
              <ul>
                {validationResult.errors.map((err, i) => (
                  <li key={i} style={{ color: '#721c24' }}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div>
              <strong>Warnings:</strong>
              <ul>
                {validationResult.warnings.map((warn, i) => (
                  <li key={i} style={{ color: '#856404' }}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {board && (
        <>
          <div className="board">
            <LevelSection level={1} animals={board.level1} max={9} biomeAssignments={board.biomeAssignments} />
            <LevelSection level={2} animals={board.level2} max={10} biomeAssignments={board.biomeAssignments} />
            <LevelSection level={3} animals={board.level3} max={5} biomeAssignments={board.biomeAssignments} />
            {board.coSpecies.length > 0 && (
              <CoSpeciesSection coSpecies={board.coSpecies} biomeAssignments={board.biomeAssignments} />
            )}
          </div>

          <div className="controls">
            <button className="primary" onClick={handleExport}>📋 Copy Board to Clipboard</button>
            <button className="primary" onClick={() => setBoard(null)}>Clear Board</button>
          </div>
        </>
      )}

      {!board && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#95a5a6', fontSize: '1.2rem' }}>
            Click the button above to generate your first Animal Exchange board! 🎯
          </p>
        </div>
      )}
    </div>
  )
}

function LevelSection({ level, animals, max, biomeAssignments }: {
  level: number
  animals: Animal[]
  max: number
  biomeAssignments?: Map<string, string>
}) {
  return (
    <div className="level-section">
      <h2 className="level-title">Level {level} ({animals.length}/{max})</h2>
      <div className="selected-animals">
        {animals.length === 0 ? (
          <p style={{ color: '#95a5a6', textAlign: 'center' }}>No animals generated</p>
        ) : (
          <>
            {groupAnimalsByBiome(animals, biomeAssignments).map(([biome, biomeAnimals]) => (
              <div key={biome} style={{ marginBottom: '20px' }}>
                <BiomeChip biome={biome} />
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '8px',
                  marginTop: '10px'
                }}>
                  {biomeAnimals.map((animal, index) => (
                    <div key={`${animal.id}-${index}`} className="animal-card" style={{ margin: 0 }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{animal.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                          {Array.isArray(animal.category) ? animal.category.join(', ') : animal.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function CoSpeciesSection({ coSpecies, biomeAssignments }: {
  coSpecies: CoSpecies[]
  biomeAssignments?: Map<string, string>
}) {
  return (
    <div className="level-section">
      <h2 className="level-title">Co-Species ({coSpecies.length})</h2>
      <div className="selected-animals">
        {coSpecies.length === 0 ? (
          <p style={{ color: '#95a5a6', textAlign: 'center' }}>No co-species generated</p>
        ) : (
          <>
{(() => {
  const bySize = new Map<number, Map<string, CoSpecies[]>>()
  coSpecies.forEach(s => {
    const biomes = Array.isArray(s.biome) ? s.biome : [s.biome]
    const assignedBiome = biomeAssignments?.get(s.id) || biomes[0]
    if (!bySize.has(s.size)) bySize.set(s.size, new Map())
    const biomeMap = bySize.get(s.size)!
    if (!biomeMap.has(assignedBiome)) biomeMap.set(assignedBiome, [])
    biomeMap.get(assignedBiome)!.push(s)
  })
  return Array.from(bySize.entries()).sort((a, b) => a[0] - b[0]).flatMap(([size, biomeMap]) => [
    <h3 key={`header-${size}`} style={{ fontSize: '1.1rem', color: '#2c3e50', margin: '15px 0', marginBottom: '15px' }}>
      {size} Tile{size > 1 ? 's' : ''} ({Array.from(biomeMap.values()).flat().length})
    </h3>,
    ...Array.from(biomeMap.entries()).map(([biome, biomeSpecies], idx) => ((
              <div key={`${size}-${biome}-${idx}`} style={{ marginBottom: '20px' }}>
                <BiomeChip biome={biome} />
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '8px',
                  marginTop: '10px'
                }}>
                  {biomeSpecies.map((species, index) => (
                    <div key={`${species.id}-${index}`} className="animal-card" style={{ margin: 0 }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{species.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                          {Array.isArray(species.category) ? species.category.join(', ') : species.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )))
  ])
})().map((el, idx) => el)}
          </>
        )}
      </div>
    </div>
  )
}

function RequiredAnimalsSelector({ allAnimals, selectedIds, onSelectionChange }: {
  allAnimals: Animal[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredAnimals = allAnimals.filter(animal => 
    animal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const toggleAnimal = (animalId: string) => {
    if (selectedIds.includes(animalId)) {
      onSelectionChange(selectedIds.filter(id => id !== animalId))
    } else {
      onSelectionChange([...selectedIds, animalId])
    }
  }
  
  return (
    <div>
      <input
        type="text"
        placeholder="Search animals..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '1rem'
        }}
      />
      <div style={{ 
        maxHeight: '200px', 
        overflowY: 'auto', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '5px'
      }}>
        {filteredAnimals.map(animal => (
          <label
            key={animal.id}
            style={{
              display: 'block',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: selectedIds.includes(animal.id) ? '#e3f2fd' : 'transparent'
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(animal.id)}
              onChange={() => toggleAnimal(animal.id)}
              style={{ marginRight: '10px' }}
            />
            {animal.name} <span style={{ color: '#999', fontSize: '0.85rem' }}>(Level {animal.level})</span>
          </label>
        ))}
      </div>
      {selectedIds.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Selected:</strong> {selectedIds.length} animal{selectedIds.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
