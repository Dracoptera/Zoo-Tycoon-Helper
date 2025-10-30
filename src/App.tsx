import React, { useState } from 'react'
import animalsData from './animals'
import coSpeciesData from './co-species'
import type { Animal } from './animals'
import type { CoSpecies } from './co-species'
import { type SelectedBoard, validateBoard } from './utils/validation'
import * as boardGen from './utils/boardGenerator'
import { injectPopularityLocked } from './utils/injector'
import { generateBalancedParks } from './utils/parkGenerator'
import { biomes } from './constants'
import type { Biome } from './constants'
import { nationalParks, checkNationalParkStatus } from './nationalParks'

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
  const [replacementMappings, setReplacementMappings] = useState<{ generated: Animal, baseGame: Animal | null }[]>([])
  const [preservedNationalParks, setPreservedNationalParks] = useState<string[]>([])
  const [brokenNationalParks, setBrokenNationalParks] = useState<{ parkName: string, missing: string[] }[]>([])
  const [generatedParks, setGeneratedParks] = useState<ReturnType<typeof generateBalancedParks>>([])
  const [parkCount, setParkCount] = useState<number>(3)
  const [parkSize, setParkSize] = useState<4 | 5>(5)
  const [parksCompatible, setParksCompatible] = useState<boolean>(false)
  const [isBiomesExpanded, setIsBiomesExpanded] = useState<boolean>(true)
  const [isParksPreserveExpanded, setIsParksPreserveExpanded] = useState<boolean>(true)

  const handleGenerateBalancedBoard = () => {
    setIsGenerating(true)
    setReplacementMappings([]) // Clear replacement mappings for balanced mode
    setBrokenNationalParks([]) // Clear broken parks
    setTimeout(() => {
      const allAnimals = animalsData.animals as Animal[]
      const allCoSpecies = coSpeciesData.coSpecies as CoSpecies[]
      // Pick 1-2 popularity-locked animals up front (matching selected biomes if set)
      const lockedCandidates = (() => {
        const locks = allAnimals.filter(a => (a as any).isPopularityLocked)
        if (selectedBiomes.length === 0) return locks
        const filtered = locks.filter(a => {
          const bs = Array.isArray(a.biome) ? a.biome : [a.biome]
          return bs.some(b => selectedBiomes.includes(b as Biome))
        })
        return filtered.length > 0 ? filtered : locks
      })()
      const shuffledLocks = [...lockedCandidates].sort(() => Math.random() - 0.5)
      const howMany = Math.random() < 0.5 ? 1 : 2
      const pickedLockIds = shuffledLocks.slice(0, howMany).map(a => a.id)
      const requiredForThisRun = Array.from(new Set([...
        requiredAnimalIds,
        ...pickedLockIds
      ]))

      const newBoard = boardGen.generateBoard(allAnimals, allCoSpecies, {
        seed: Date.now(),
        strict: true,
        requiredAnimals: requiredForThisRun,
        selectedBiomes: selectedBiomes.length > 0 ? selectedBiomes : undefined,
        preserveNationalParks: preservedNationalParks
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

  const handleGenerateBaseGameCompatible = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const allAnimals = animalsData.animals as Animal[]
      const allCoSpecies = coSpeciesData.coSpecies as CoSpecies[]
      
      const newBoard = boardGen.generateBoard(allAnimals, allCoSpecies, {
        seed: Date.now(),
        strict: true,
        requiredAnimals: requiredAnimalIds,
        selectedBiomes: selectedBiomes.length > 0 ? selectedBiomes : undefined,
        compatibleWithBaseGame: true,
        preserveNationalParks: preservedNationalParks
      })
      if (newBoard) {
        setBoard(newBoard)
        
        // Calculate replacement mappings
        const mappings = boardGen.getReplacementMappings(newBoard, allAnimals)
        setReplacementMappings(mappings)
        
        // Check which Base Game National Parks are broken
        const allAnimalsMap = new Map(allAnimals.map(a => [a.id, a]))
        const boardAnimalIds = new Set([...newBoard.level1, ...newBoard.level2, ...newBoard.level3].map(a => a.id))
        const boardCoSpeciesIds = new Set(newBoard.coSpecies.map(c => c.id))
        
        const broken = nationalParks
          .filter(park => park.game === 'base')
          .map(park => {
            const status = checkNationalParkStatus(park, boardAnimalIds, boardCoSpeciesIds)
            if (!status.complete) {
              const missingNames = status.missing.map(id => {
                if (id.includes('OR')) return id
                const animal = allAnimalsMap.get(id)
                return animal ? animal.name : id
              })
              return { parkName: park.name, missing: missingNames }
            }
            return null
          })
          .filter((p): p is { parkName: string, missing: string[] } => p !== null)
        
        setBrokenNationalParks(broken)
        
        // Pass available co-species to validation so it knows which biomes have co-species
        const validation = validateBoard(newBoard, allCoSpecies)
        setValidationResult(validation)
      } else {
        const maxAttempts = selectedBiomes.length > 0 && selectedBiomes.length < 6 ? 20000 : 2000
        alert(`Could not generate a compatible board after ${maxAttempts} attempts. Try selecting exactly 4 biomes, more biomes, or fewer required animals.`)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => setIsBiomesExpanded(!isBiomesExpanded)}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}
          >
            {isBiomesExpanded ? '▼' : '▶'}
          </button>
          <h3 style={{ margin: 0 }}>Select Biomes</h3>
        </div>
        {isBiomesExpanded && (
          <>
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
          </>
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

      <div style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => setIsParksPreserveExpanded(!isParksPreserveExpanded)}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}
          >
            {isParksPreserveExpanded ? '▼' : '▶'}
          </button>
          <h3 style={{ margin: 0 }}>Preserve National Parks</h3>
        </div>
        {isParksPreserveExpanded && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            Select up to 5 National Parks (Base or Expansion) to preserve in your generated board:
          </p>
        )}
        {isParksPreserveExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Base Game</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nationalParks.filter(park => park.game === 'base').map(park => (
                <label
                  key={park.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 15px',
                    border: `2px solid ${biomeColors[park.biome] || '#6f42c1'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: preservedNationalParks.includes(park.id) ? (biomeColors[park.biome] || '#6f42c1') : 'transparent',
                    color: preservedNationalParks.includes(park.id) ? '#fff' : '#333',
                    opacity: !preservedNationalParks.includes(park.id) && preservedNationalParks.length >= 5 ? 0.5 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preservedNationalParks.includes(park.id)}
                    disabled={!preservedNationalParks.includes(park.id) && preservedNationalParks.length >= 5}
                    onChange={() => {
                      if (preservedNationalParks.includes(park.id)) {
                        setPreservedNationalParks(preservedNationalParks.filter(id => id !== park.id))
                      } else {
                        if (preservedNationalParks.length < 5) {
                          setPreservedNationalParks([...preservedNationalParks, park.id])
                        }
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {park.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Expansion</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nationalParks.filter(park => park.game === 'expansion').map(park => (
                <label
                  key={park.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 15px',
                    border: `2px solid ${biomeColors[park.biome] || '#6f42c1'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: preservedNationalParks.includes(park.id) ? (biomeColors[park.biome] || '#6f42c1') : 'transparent',
                    color: preservedNationalParks.includes(park.id) ? '#fff' : '#333',
                    opacity: !preservedNationalParks.includes(park.id) && preservedNationalParks.length >= 5 ? 0.5 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preservedNationalParks.includes(park.id)}
                    disabled={!preservedNationalParks.includes(park.id) && preservedNationalParks.length >= 5}
                    onChange={() => {
                      if (preservedNationalParks.includes(park.id)) {
                        setPreservedNationalParks(preservedNationalParks.filter(id => id !== park.id))
                      } else {
                        if (preservedNationalParks.length < 5) {
                          setPreservedNationalParks([...preservedNationalParks, park.id])
                        }
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {park.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        )}
        {isParksPreserveExpanded && preservedNationalParks.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => setPreservedNationalParks([])}
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

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          className="primary" 
          onClick={handleGenerateBalancedBoard}
          disabled={isGenerating || (selectedBiomes.length > 0 && selectedBiomes.length !== 4)}
          style={{ 
            fontSize: '1.2rem', 
            padding: '15px 40px', 
            marginRight: '10px',
            background: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? '#ccc' : '#28a745',
            cursor: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Generating...' : 
           (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? `Please select exactly 4 biomes (${selectedBiomes.length}/4)` : 
           '⚖️ Generate Balanced Board'}
        </button>
        
        <button 
          className="primary" 
          onClick={handleGenerateBaseGameCompatible}
          disabled={isGenerating || (selectedBiomes.length > 0 && selectedBiomes.length !== 4)}
          style={{ 
            fontSize: '1.2rem', 
            padding: '15px 40px', 
            background: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? '#ccc' : '#17a2b8',
            cursor: (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Generating...' : 
           (selectedBiomes.length > 0 && selectedBiomes.length !== 4) ? `Please select exactly 4 biomes (${selectedBiomes.length}/4)` : 
           '🎲 Generate Board compatible with Base Game Sheet'}
        </button>
      </div>

      {replacementMappings.length > 0 && (
        <div style={{
          background: '#d1ecf1',
          border: '2px solid #17a2b8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#0c5460' }}>
            🔄 Animal Replacements for Base Game Compatible Mode
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#0c5460', marginBottom: '15px' }}>
            The following animals from your generated board replace these Base Game animals due to compatible group sizes:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '10px'
          }}>
            {replacementMappings.map((mapping, idx) => (
              <div key={`${mapping.generated.id}-${idx}`} style={{ 
                padding: '10px', 
                background: '#fff', 
                borderRadius: '4px',
                border: '1px solid #bee5eb'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {mapping.generated.name}
                </div>
                {mapping.baseGame ? (
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    → replaces <strong>{mapping.baseGame.name}</strong>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    → no close match found
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {brokenNationalParks.length > 0 && (
        <div style={{
          background: '#f8d7da',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#721c24' }}>
            ⚠️ Broken National Parks
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#721c24', marginBottom: '15px' }}>
            The following Base Game National Parks are incomplete in your generated board:
          </p>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {brokenNationalParks.map((park, idx) => (
              <div key={idx} style={{ 
                padding: '12px', 
                background: '#fff', 
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', color: '#721c24' }}>
                  {park.parkName}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#721c24' }}>
                  Missing: {park.missing.join(', ')}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#721c24', marginTop: '15px', fontStyle: 'italic' }}>
            Tip: Use the "Preserve National Parks" checkboxes above to keep specific parks intact.
          </p>
        </div>
      )}

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
            <span style={{ marginLeft: 10 }} />
            <label style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Inject popularity-locked:
              <select id="injectCount" defaultValue={"1"} style={{ marginLeft: 6 }}>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
            <button
              className="primary"
              onClick={() => {
                if (!board) return
                const allAnimals = animalsData.animals as Animal[]
                const selectEl = document.getElementById('injectCount') as HTMLSelectElement | null
                const count = (selectEl ? parseInt(selectEl.value) : 1) as 1 | 2
                const newBoard = injectPopularityLocked(board, allAnimals, count, selectedBiomes.length > 0 ? selectedBiomes : undefined)
                setBoard(newBoard)
                const validation = validateBoard(newBoard, coSpeciesData.coSpecies as CoSpecies[])
                setValidationResult(validation)
              }}
            >
              Apply
            </button>
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

      {/* Bottom: Generate Balanced Parks */}
      <div style={{ marginTop: '30px', marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Generate Balanced Parks</h3>
        {!board && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
            Generate a board first to enable park generation.
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px', opacity: board ? 1 : 0.6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Count</span>
            <select value={parkCount} onChange={e => setParkCount(parseInt(e.target.value))} disabled={!board}>
              {[3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Size</span>
            <select value={parkSize} onChange={e => setParkSize(parseInt(e.target.value) as 4 | 5)} disabled={!board}>
              {[4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={parksCompatible} onChange={e => setParksCompatible(e.target.checked)} disabled={!board} />
            <span>Base Game compatible sizes</span>
          </label>
          <button
            onClick={() => {
              if (!board) return
              const boardAnimals = [...board.level1, ...board.level2, ...board.level3] as Animal[]
              const parks = generateBalancedParks(boardAnimals, {
                count: parkCount,
                size: parkSize,
                selectedBiomes: selectedBiomes.length > 0 ? selectedBiomes : undefined,
                compatibleWithBaseGame: parksCompatible,
                availableCoSpecies: board.coSpecies as CoSpecies[],
                seed: Date.now()
              })
              setGeneratedParks(parks)
            }}
            className="primary"
            style={{ padding: '8px 16px', cursor: board ? 'pointer' : 'not-allowed', background: board ? undefined : '#ccc' }}
            disabled={!board}
          >
            Generate Parks
          </button>
        </div>

        {generatedParks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {generatedParks.map((park, idx) => {
              const color = biomeColors[park.biome] || '#6c757d'
              const animalsById = new Map((animalsData.animals as Animal[]).map(a => [a.id, a]))
              return (
                <div key={park.id || idx} style={{ border: `2px solid ${color}`, borderRadius: 8, background: '#fff' }}>
                  <div style={{ background: color, color: '#fff', padding: '8px 12px', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                    <strong>{park.name}</strong>
                    <span style={{ marginLeft: 8, opacity: 0.9 }}>({park.biome})</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {park.animalIds.map(id => (
                        <li key={id} style={{ marginBottom: 4 }}>{animalsById.get(id)?.name || id}</li>
                      ))}
                    </ul>
                    {park.coSpeciesIds && park.coSpeciesIds.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Co-species:</strong>{' '}
                        {park.coSpeciesIds.map((id, i) => {
                          const name = (coSpeciesData.coSpecies as CoSpecies[]).find(c => c.id === id)?.name || id
                          return <span key={id}>{i > 0 ? ', ' : ''}{name}</span>
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                      <button
                        onClick={() => {
                          const requiredSet = new Set(requiredAnimalIds)
                          park.animalIds.forEach(id => requiredSet.add(id))
                          setRequiredAnimalIds(Array.from(requiredSet))
                        }}
                        className="primary"
                      >
                        Require these animals
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>Score: {park.score.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
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
                  {biomeAnimals.map((animal, index) => {
                    const isLocked = (animal as any).isPopularityLocked === true
                    return (
                      <div
                        key={`${animal.id}-${index}`}
                        className="animal-card"
                        style={{
                          margin: 0,
                          border: isLocked ? '2px solid #e67e22' : undefined
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {animal.name}
                            {isLocked && (
                              <span style={{
                                fontSize: '0.7rem',
                                background: '#e67e22',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '6px'
                              }}>
                                🔒 Popularity Locked
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                            {Array.isArray(animal.category) ? animal.category.join(', ') : animal.category}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
