export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <label className="search-bar">
      <span>🔎</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}
