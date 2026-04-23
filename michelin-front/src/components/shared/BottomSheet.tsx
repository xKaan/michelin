import type { ReactNode } from 'react'
import { useSheetDrag } from '@/hooks/useSheetDrag'

interface BottomSheetProps {
  onClose: () => void
  maxHeight?: string
  children: ReactNode
}

export function BottomSheet({ onClose, maxHeight = '80vh', children }: BottomSheetProps) {
  const { handleProps, sheetStyle } = useSheetDrag(onClose)
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div
        className="w-full md:w-1/3 md:min-w-96 flex flex-col rounded-t-3xl md:rounded-3xl bg-background border-t md:border border-border"
        style={{ ...sheetStyle, maxHeight }}
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden">
          <div {...handleProps}>
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
