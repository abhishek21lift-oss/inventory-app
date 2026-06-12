const conditions = ['', 'New', 'Good', 'Fair', 'Needs Service']

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
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="input-gym w-full pl-10 pr-4"
        />
      </div>
      <div className="relative min-w-[150px]">
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          className="input-gym w-full"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="relative min-w-[140px]">
        <select
          value={conditionFilter}
          onChange={e => onConditionChange(e.target.value)}
          className="input-gym w-full"
        >
          {conditions.map(c => <option key={c} value={c}>{c || 'All Conditions'}</option>)}
        </select>
      </div>
    </div>
  )
}
