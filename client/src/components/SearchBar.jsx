export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <label className="search-bar">
      <span className="sr-only">Search</span>
      <span aria-hidden="true">🔎</span>
      <input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
