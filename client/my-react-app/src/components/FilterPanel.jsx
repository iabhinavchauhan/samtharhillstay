export default function FilterPanel({ filters, onFilterChange }) {
  const filterOptions = [
    { key: 'type', label: 'Type', options: ['All', 'Mountain', 'Beach', 'Desert', 'Forest', 'Lake', 'Waterfall', 'Island', 'Snow', 'River', 'Ocean'] },
    { key: 'budget', label: 'Budget', options: ['All', '$', '$$', '$$$'] },
    { key: 'difficulty', label: 'Difficulty', options: ['All', 'Easy', 'Moderate', 'Hard'] },
  ]

  return (
    <div className="filter-panel">
      {filterOptions.map((filter) => (
        <label key={filter.key} className="filter-group">
          <span>{filter.label}</span>
          <select value={filters[filter.key]} onChange={(event) => onFilterChange(filter.key, event.target.value)}>
            {filter.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}
