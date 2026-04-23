// src/components/shared/FilterChip.tsx
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors',
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-card text-foreground border-border/60 hover:border-primary/40',
      )}
    >
      {label}
    </button>
  )
}
