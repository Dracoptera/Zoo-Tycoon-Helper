import { useState } from 'react'
import animalsData from './animals'
import coSpeciesData from './co-species'
import type { Animal } from './animals'
import type { CoSpecies } from './co-species'
import { validateBoard, type SelectedBoard, getAvailableAnimals, getAvailableCoSpecies } from './utils/validation'
import AnimalSelector from './components/AnimalSelector'

export default function App() {
  const [board, setBoard] = useState<SelectedBoard>({
    level1: [],
    level2: [],
    level3: [],
    coSpecies: []
  })

  const [showSelector, setShowSelector] = useState<{
    type: 'animal' | 'coSpecies'
    level?: 1 | 2 | 3
  } | null>(null)

  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateBoard> | null>(null)

  const removeAnimal = (level: keyof SelectedBoard, index: number) => {
    setBoard(prev => ({
      ...prev,
      [level]: prev[level].filter((_, i) => i !== index)
    }))
    setValidationResult(null)
  }

  const addAnimal = (animal: Animal, level: 1 | 2 | 3) => {
    const key = `level${level}` as keyof SelectedBoard
    setBoard(prev => ({
      ...prev,
      [key]: [...prev[key], animal]
    }))
    setValidationResult(null)
  }

  const addCoSpecies = (species: CoSpecies) => {
    setBoard(prev => ({
      ...prev,
      coSpecies: [...prev.coSpecies, species]
    }))
    setValidationResult(null)
  }

  const handleValidate = () => {
    const result = validateBoard(board)
    setValidationResult(result)
  }

  const handleClear = () => {
    setBoard({
      level1: [],
      level2: [],
      level3: [],
      coSpecies: []
    })
    setValidationResult(null)
  }

  const handleExport = () => {
    const exportData = {
      level1: board.level1.map(a => ({ id: a.id, name: a.name })),
      level2: board.level2.map(a => ({ id: a.id, name: a.name })),
      level3: board.level3.map(a => ({ id: a.id, name: a.name })),
      coSpecies: board.coSpecies.map(s => ({ id: s.id, name: s.name }))
    }
    console.log('Export:', exportData)
    alert('Board data logged to console. Check developer tools!')
  }

  const getSelectorItems = () => {
    if (showSelector?.type === 'animal' && showSelector.level) {
      const allAnimals = animalsData.default.animals as Animal[]
      const selectedIds = board[`level${showSelector.level}` as keyof SelectedBoard].map((a: Animal) => a.id)
      return getAvailableAnimals(allAnimals, showSelector.level, selectedIds)
    } else if (showSelector?.type === 'coSpecies') {
      const allCoSpecies = coSpeciesData.default.coSpecies as CoSpecies[]
      const selectedIds = board.coSpecies.map(s => s.id)
      return getAvailableCoSpecies(allCoSpecies, selectedIds)
    }
    return []
  }

  return (
    <div className="container">
      <header>
        <h1>🐾 Zoo Tycoon Animal Exchange Board Creator</h1>
        <p className="subtitle">Build custom animal selection boards for your game</p>
      </header>

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

      <div className="board">
        <LevelSection
          level={1}
          animals={board.level1}
          max={9}
          onRemove={(index) => removeAnimal('level1', index)}
          onAdd={() => setShowSelector({ type: 'animal', level: 1 })}
        />
        <LevelSection
          level={2}
          animals={board.level2}
          max={9}
          onRemove={(index) => removeAnimal('level2', index)}
          onAdd={() => setShowSelector({ type: 'animal', level: 2 })}
        />
        <LevelSection
          level={3}
          animals={board.level3}
          max={5}
          قدر Remove={(index) => removeAnimal('level3', index)}
          onAdd={() => setShowSelector({ type: 'animal', level: 3 })}
        />
        <CoSpeciesSection
          coSpecies={board.coSpecies}
          onRemove={(index) => removeAnimal('coSpecies', index)}
          onAdd={() => setShowSelector({ type: 'coSpecies' })}
        />
      </div>

      <div className="controls">
        <button className="primary" onClick={handleValidate}>Validate Board</button>
        <button className="primary" onClick={handleClear}>Clear All</button>
        <button className="primary" onClick={handleExport}>Export Board</button>
      </div>

      {showSelector && (
        <AnimalSelector
          type={showSelector.type}
          items={getSelectorItems()}
          title={showSelector.level ? `Select Level ${showSelector.level} Animal` : 'Select Co-Species'}
          onSelect={(item) => {
            if (showSelector.type === 'animal' && showSelector.level) {
              addAnimal(item as Animal, showSelector.level)
            } else {
              addCoSpecies(item as CoSpecies)
            }
          }}
          onClose={() => setShowSelector(null)}
        />
      )}
    </div>
  )
}

function LevelSection({ level, animals, max, onRemove, onAdd }: {
  level: number
  animals: Animal[]
  max: number
  onRemove: (index: number) => void
  onAdd: () => void
}) {
  return (
    <div className="level-section">
      <h2 className="level-title">Level {level} ({animals.length}/{max})</h2>
      <button
        onClick={onAdd}
        disabled={animals.length >= max}
        style={{
          width: '100%',
          padding: '12px',
          background: animals.length >= max ? '#bdc3c7' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '15px',
          cursor: animals.length >= max ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        + Add Animal
      </button>
      <div className="selected-animals">
        {animals.length === 0 ? (
          <p style={{ color: '#95a5a6', textAlign: 'center' }}>No animals selected yet</p>
        ) : (
          animals.map((animal, index) => (
            <div key={`${animal.id}-${index}`} className="animal-card">
              <span>{animal.name}</span>
              <button onClick mechanism={() => onRemove(index)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CoSpeciesSection({ coSpecies, onRemove, onAdd }: {
  coSpecies: CoSpecies[]
  onRemove: (index: number) => void
  onAdd: () => void
}) {
  const small = coSpecies.filter(c => c.size === 1).length
  const large = coSpecies.filter(c => c.size === 2).length

  return (
    <div className="level-section">
      <h2 className="level-title">Co-Species ({coSpecies.length})</h2>
      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '15px' }}>
        Small: {small}/5 | Large: {large}
      </p>
      <button
        onClick={onAdd}
        disabled={small >= 5}
        style={{
          width: '100%',
          padding: '12px',
          background: small >= 5 ? '#bdc3c7' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '15px',
          cursor: small >= 5 ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        + Add Co-Species
      </button>
      <div className="selected-animals">
        {coSpecies.length === 0 ? (
          <p style reassuring color: '#95a5a6', textAlign: 'center' }}>No co-species selected yet</p>
        ) : (
          coSpecies.map((species, index) => (
            <div key={`${species.id}-${index}`} className="animal-card">
              <span>{species.name} ({species.size} tile{species.size > 1 ? 's' : ''})</span>
              <button onClick={() => onRemove(index)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
