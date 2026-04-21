import { useEffect, useRef, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import './MapPage.css'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import type { EstablishmentView } from '@/types/database'

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY

const STORAGE_KEY = 'map_position'
const LYON: [number, number] = [4.8357, 45.764]
const DEFAULT = { center: LYON, zoom: 13 }

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as { center: [number, number]; zoom: number }
  } catch {}
  return DEFAULT
}

function markerContent(status: string): string {
  switch (status) {
    case 'three': return '★★★'
    case 'two':   return '★★'
    case 'one':   return '★'
    case 'bib':   return 'Bib'
    default:      return '·'
  }
}

function placeMarkers(
  map: maptilersdk.Map,
  data: EstablishmentView[],
  markersRef: React.MutableRefObject<maptilersdk.Marker[]>,
  onClickRef: React.MutableRefObject<(e: EstablishmentView) => void>,
) {
  markersRef.current.forEach(m => m.remove())
  markersRef.current = []

  data.forEach(e => {
    if (e.lat == null || e.lng == null) return

    const el = document.createElement('div')
    el.className = `michelin-marker michelin-marker-${e.michelin_status}`
    el.textContent = markerContent(e.michelin_status)

    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      map.flyTo({ center: [e.lng!, e.lat!], zoom: 16, duration: 600 })
      onClickRef.current(e)
    })

    const marker = new maptilersdk.Marker({ element: el })
      .setLngLat([e.lng, e.lat])
      .addTo(map)

    markersRef.current.push(marker)
  })
}

interface Props {
  onEstablishmentClick: (e: EstablishmentView) => void
}

export function MapPage({ onEstablishmentClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maptilersdk.Map | null>(null)
  const markersRef = useRef<maptilersdk.Marker[]>([])
  const mapLoadedRef = useRef(false)
  const establishmentsRef = useRef<EstablishmentView[]>([])
  const onEstablishmentClickRef = useRef(onEstablishmentClick)
  const userPosRef = useRef<[number, number] | null>(null)
  const [located, setLocated] = useState(false)

  const { data: establishments } = useAllEstablishments()

  useEffect(() => {
    onEstablishmentClickRef.current = onEstablishmentClick
  }, [onEstablishmentClick])

  // Update markers when establishments data arrives
  useEffect(() => {
    if (!establishments?.length) return
    establishmentsRef.current = establishments
    if (mapRef.current && mapLoadedRef.current) {
      placeMarkers(mapRef.current, establishments, markersRef, onEstablishmentClickRef)
    }
  }, [establishments])

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

    const HIDE_SOURCE_LAYERS = [
      'poi_sport', 'poi_shopping', 'poi_transport', 'poi_healthcare',
      'poi_education', 'poi_public', 'poi_culture', 'poi_tourism',
      'poi_food', 'poi_accommodation',
      'street_furniture', 'tree',
    ]

    map.on('load', () => {
      mapLoadedRef.current = true

      map.getStyle().layers.forEach((l) => {
        const sl = (l as { 'source-layer'?: string })['source-layer']
        if (sl && HIDE_SOURCE_LAYERS.includes(sl)) {
          map.setLayoutProperty(l.id, 'visibility', 'none')
        }
      })

      // Place markers if data already loaded
      if (establishmentsRef.current.length) {
        placeMarkers(map, establishmentsRef.current, markersRef, onEstablishmentClickRef)
      }

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

      })
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      mapLoadedRef.current = false
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
