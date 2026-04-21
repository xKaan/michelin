import { useEffect, useRef, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import './MapPage.css'
import type { SelectedPoi } from '@/components/PoiCard'

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY

const STORAGE_KEY = 'map_position'
const DEFAULT = { center: [2.3488, 48.8534] as [number, number], zoom: 17 }

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as { center: [number, number]; zoom: number }
  } catch {}
  return DEFAULT
}

interface Props {
  onPoiClick: (poi: SelectedPoi) => void
}

export function MapPage({ onPoiClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maptilersdk.Map | null>(null)
  const userPosRef = useRef<[number, number] | null>(null)
  const [located, setLocated] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const saved = loadSavedPosition()

    const map = new maptilersdk.Map({
      container: containerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: saved.center,
      zoom: saved.zoom,
      geolocateControl: false,
      navigationControl: false,
    })
    mapRef.current = map

    map.on('styleimagemissing', (e: { id: string }) => {
      map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) })
    })

    const KEEP_LAYERS = ['Food', 'Accommodation']
    const HIDE_SOURCE_LAYERS = [
      'poi_sport', 'poi_shopping', 'poi_transport', 'poi_healthcare',
      'poi_education', 'poi_public', 'poi_culture', 'poi_tourism',
      'street_furniture', 'tree',
    ]

    map.on('load', () => {
      map.getStyle().layers.forEach((l) => {
        const sl = (l as { 'source-layer'?: string })['source-layer']
        if (sl && HIDE_SOURCE_LAYERS.includes(sl) && !KEEP_LAYERS.includes(l.id)) {
          map.setLayoutProperty(l.id, 'visibility', 'none')
        }
      })

      KEEP_LAYERS.forEach((id) => {
        map.setLayerZoomRange(id, 10, 24)
        map.setLayoutProperty(id, 'icon-size', 1.8)
        map.setLayoutProperty(id, 'text-size', 13)
        map.setPaintProperty(id, 'icon-color', '#cb0028')
        map.setPaintProperty(id, 'text-color', '#cb0028')
      })

      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(
          [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]],
          { layers: KEEP_LAYERS }
        )
        if (!features.length) return
        const f = features[0]
        onPoiClick({
          name: f.properties?.name,
          class: f.properties?.class ?? f.properties?.type,
          subclass: f.properties?.subclass,
        })
      })

      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const pos: [number, number] = [coords.longitude, coords.latitude]
        userPosRef.current = pos
        setLocated(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ center: pos, zoom: 17 }))

        map.addSource('user-location', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Point', coordinates: pos }, properties: {} },
        })

        map.addLayer({
          id: 'user-location-halo',
          type: 'circle',
          source: 'user-location',
          paint: {
            'circle-radius': 22,
            'circle-color': '#4a90e2',
            'circle-opacity': 0.15,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#4a90e2',
            'circle-stroke-opacity': 0.4,
          },
        })

        map.addLayer({
          id: 'user-location-dot',
          type: 'circle',
          source: 'user-location',
          paint: {
            'circle-radius': 7,
            'circle-color': '#4a90e2',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff',
          },
        })

        map.flyTo({ center: pos, zoom: 17 })
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [onPoiClick])

  return (
    <div className="fixed inset-0 -z-10 sm:relative sm:inset-auto sm:z-auto sm:max-w-4xl sm:mx-auto sm:pt-8">
      <div
        ref={containerRef}
        className="size-full sm:h-[70vh] sm:rounded-2xl sm:overflow-hidden sm:border sm:border-border sm:shadow-lg"
      />
      {located && (
        <button
          onClick={() => {
            if (userPosRef.current && mapRef.current) {
              mapRef.current.flyTo({ center: userPosRef.current, zoom: 17 })
            }
          }}
          className="absolute bottom-32 right-4 z-10 size-11 rounded-full bg-background shadow-xl border border-border/60 flex items-center justify-center text-primary hover:bg-muted transition-colors"
          aria-label="Retour à ma position"
        >
          <LocateFixed className="size-5" />
        </button>
      )}
    </div>
  )
}
