import { useEffect, useRef } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import './MapPage.css'

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY

export function MapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maptilersdk.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = new maptilersdk.Map({
      container: containerRef.current,
      style: maptilersdk.MapStyle.STREETS_V4,
      center: [2.3488, 48.8534],
      zoom: 12,
      geolocateControl: false,
      navigationControl: false,
      attributionControl: false,
      logoControl: false,
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 sm:relative sm:inset-auto sm:z-auto sm:max-w-4xl sm:mx-auto sm:pt-8">
      <div
        ref={containerRef}
        className="size-full sm:h-[70vh] sm:rounded-2xl sm:overflow-hidden sm:border sm:border-border sm:shadow-lg"
      />
    </div>
  )
}
