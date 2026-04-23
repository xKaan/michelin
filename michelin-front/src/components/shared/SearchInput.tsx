import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher...', autoFocus }: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
      <Search className="size-4 text-muted-foreground flex-shrink-0" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        autoFocus={autoFocus}
      />
    </div>
  )
}
