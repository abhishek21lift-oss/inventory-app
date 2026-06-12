interface SearchBarProps {
  search: string
  onSearchChange: (v: string) => void
  categoryFilter: string
  onCategoryChange: (v: string) => void
  categories: { id: string; name: string }[]
}

export default function SearchBar({ search, onSearchChange, categoryFilter, onCategoryChange, categories }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search equipment, supplements..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="input-neon w-full pl-10 pr-4 py-2.5 text-sm"
        />
      </div>
      <div className="relative min-w-[160px]">
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          className="input-neon w-full px-4 py-2.5 text-sm appearance-none"
        >
          <option value="" className="bg-[#12141a]">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name} className="bg-[#12141a]">{c.name}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}
