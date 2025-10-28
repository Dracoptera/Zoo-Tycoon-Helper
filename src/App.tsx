import React, { useState } from 'react'
import animalsData from './animals'
import coSpeciesData from './co-species'
import type { Animal } from './animals'
import type { CoSpecies } from './co-species'
import { type SelectedBoard, validateBoard } from './utils/validation'
import { generateBoard } from './utils/boardGenerator'

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
function groupAnimalsByBiome<T extends { biome: string | string[] }>(items: T[]): [string, T[]][] {
  const grouped = new Map<string, T[]>()
  items.forEach(item => {
    const biomes = Array.isArray(item.biome) ? item.biome : [item.biome]
    biomes.forEach(biome => {
      if (!grouped.has(biome)) {
        grouped.set(biome, [])
      }
      grouped.get(biome)!.push(item)
    })
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

  const handleGenerateBoard = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const allAnimals = animalsData.animals as Animal[]
      const allCoSpecies = coSpeciesData.coSpecies as CoSpecies[]
      const newBoard = generateBoard(allAnimals, allCoSpecies, {
        seed: Date.now()
      })
      if (newBoard) {
        setBoard(newBoard)
        const validation = validateBoard(newBoard)
        setValidationResult(validation)
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
        <p className="subtitle">Automatically generates valid animal selection boards for your game</p>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          className="primary" 
          onClick={handleGenerateBoard}
          disabled={isGenerating}
          style={{ fontSize: '1.2rem', padding: '15px 40px' }}
        >
          {isGenerating ? 'Generating...' : '🎲 Generate New Board'}
        </button>
      </div>

      {validationResult && (
        <div style={{
          background: validationResult.valid ? '#d4edda' : '#f8d7da',
          border: `2px solid ${validationResult.valid ? '#28a745' : '#dc3545'}`,
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
            <LevelSection level={1} animals={board.level1} max={9} />
            <LevelSection level={2} animals={board.level2} max={9} />
            <LevelSection level={3} animals={board.level3} max={5} />
            {board.coSpecies.length > 0 && (
              <CoSpeciesSection coSpecies={board.coSpecies} />
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

function LevelSection({ level, animals, max }: {
  level: number
  animals: Animal[]
  max: number
}) {
  return (
    <div className="level-section">
      <h2 className="level-title">Level {level} ({animals.length}/{max})</h2>
      <div className="selected-animals">
        {animals.length === 0 ? (
          <p style={{ color: '#95a5a6', textAlign: 'center' }}>No animals generated</p>
        ) : (
          <>
            {groupAnimalsByBiome(animals).map(([biome, biomeAnimals]) => (
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

function CoSpeciesSection({ coSpecies }: {
  coSpecies: CoSpecies[]
}) {
  return (
    <div className="level-section">
      <h2 className="level-title">Co-Species ({coSpecies.length})</h2>
      <div className="selected-animals">
        {coSpecies.length === 0 ? (
          <p style={{ color: '#95a5a6', textAlign: 'center' }}>No co-species generated</p>
        ) : (
          <>
            {groupAnimalsByBiome(coSpecies).map(([biome, biomeSpecies]) => (
              <div key={biome} style={{ marginBottom: '20px' }}>
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
                          {species.size} tile{species.size > 1 ? 's' : ''}
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
