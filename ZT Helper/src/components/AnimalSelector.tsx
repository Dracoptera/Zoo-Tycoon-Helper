import { useState } from 'react'
import type { Animal } from '../animals'
import type { CoSpecies } from '../co-species'

type AnimalSelectorProps = {
  type: 'animal' | 'coSpecies'
  items: Animal[] | CoSpecies[]
  title: string
  onSelect: (item: Animal | CoSpecies) => void
  onClose: () => void
}

export default function AnimalSelector({ type, items, title, onSelect, onClose }: AnimalSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    let matchesCategory = true
    
    if (selectedCategory !== 'all' && type === 'animal') {
      const animal = item as Animal
      const categories = Array.isArray(animal.category) ? animal.category : [animal.category]
      matchesCategory = categories.some(c => c.toLowerCase() === selectedCategory.toLowerCase())
    }
    
    return matchesSearch && matchesCategory
  })

  const categories = type === 'animal'
    ? [...new Set(items.flatMap(item => {
        const animal = item as Animal
        return Array.isArray(animal.category) ? animal.category : [animal.category]
      }))]
    : []

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>{title}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search animals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </div>

        {type === 'animal' && categories.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '0.9rem',
                border: '2px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item)
                onClose()
              }}
              style={{
                padding: '12px',
                background: '#e8f4f8',
                border: '2px solid #3498db',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3498db'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e8f4f8'
                e.currentTarget.style.color = '#2c3e50'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
              {type === 'coSpecies' && (
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {(item as CoSpecies).size} tile{(item as CoSpecies).size > 1 ? 's' : ''}
                </div>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#95a5a6' }}>
            No animals found matching your search
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

