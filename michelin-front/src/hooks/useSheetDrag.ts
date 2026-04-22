import { useRef, useState } from 'react'

export function useSheetDrag(onClose: () => void, threshold = 72) {
  const startY = useRef<number | null>(null)
  const [dy, setDy] = useState(0)
  const dragging = useRef(false)

  function onStart(y: number) {
    startY.current = y
    dragging.current = true
  }

  function onMove(y: number) {
    if (!dragging.current || startY.current === null) return
    setDy(Math.max(0, y - startY.current))
  }

  function onEnd() {
    if (!dragging.current) return
    dragging.current = false
    const d = dy
    setDy(0)
    startY.current = null
    if (d >= threshold) onClose()
  }

  const handleProps = {
    className: 'flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none',
    onTouchStart: (e: React.TouchEvent) => onStart(e.touches[0].clientY),
    onTouchMove:  (e: React.TouchEvent) => onMove(e.touches[0].clientY),
    onTouchEnd:   onEnd,
    onMouseDown:  (e: React.MouseEvent) => onStart(e.clientY),
    onMouseMove:  (e: React.MouseEvent) => dragging.current && onMove(e.clientY),
    onMouseUp:    onEnd,
    onMouseLeave: onEnd,
  }

  const sheetStyle: React.CSSProperties = {
    transform: `translateY(${dy}px)`,
    transition: dy === 0 ? 'transform 0.3s cubic-bezier(0.32,0.72,0,1)' : 'none',
  }

  return { handleProps, sheetStyle }
}
