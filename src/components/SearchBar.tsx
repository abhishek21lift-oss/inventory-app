import { Search } from 'lucide-react'

const CONDITIONS = ['', 'New', 'Good', 'Fair', 'Needs Service']

interface SearchBarProps {
  search: string
  onSearchChange: (v: string) => void
  categoryFilter: string
  onCategoryChange: (v: string) => void
  conditionFilter: string
  onConditionChange: (v: string) => void
  categories: { id: string; name: string }[]
}

export default function SearchBar({ search, onSearchChange, categoryFilter, onCategoryChange, conditionFilter, onConditionChange, categories }: SearchBarProps) {
  return (
    <div className="filter-row">
      <div className="search-wrap" style={{ maxWidth: 320 }}>
        <span className="search-icon"><Search size={14} /></span>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <select
        value={categoryFilter}
        onChange={e => onCategoryChange(e.target.value)}
        className="input"
        style={{ width: 'auto', minWidth: 140 }}
      >
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select
        value={conditionFilter}
        onChange={e => onConditionChange(e.target.value)}
        className="input"
        style={{ width: 'auto', minWidth: 130 }}
      >
        {CONDITIONS.map(c => <option key={c} value={c}>{c || 'All Conditions'}</option>)}
      </select>
    </div>
  )
}
