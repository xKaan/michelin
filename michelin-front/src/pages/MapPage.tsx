import { useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { LocateFixed } from 'lucide-react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import './MapPage.css'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useMapReviewBubbles } from '@/hooks/useMapReviewBubbles'
import { useBatchAvatarUrls } from '@/hooks/useMascot'
import { ReviewBubble } from '@/components/ReviewBubble'
import type { EstablishmentView } from '@/types/database'

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY

const STORAGE_KEY = 'map_position'
const LYON: [number, number] = [4.8357, 45.764]
const DEFAULT = { center: LYON, zoom: 13 }
const BUBBLE_ZOOM_THRESHOLD = 15
const SOURCE_ID = 'establishments'
const CLICKABLE_LAYERS = ['michelin-three', 'michelin-two', 'michelin-one', 'michelin-bib', 'michelin-hotel', 'michelin-none']

const HIDE_SOURCE_LAYERS = [
  'poi_sport', 'poi_shopping', 'poi_transport', 'poi_healthcare',
  'poi_education', 'poi_public', 'poi_culture', 'poi_tourism',
  'poi_food', 'poi_accommodation',
  'street_furniture', 'tree',
]

const MARKER_SPECS = {
  three: { size: 48, border: 2.5, borderColor: '#f59e0b',              stars: 3, starSize: 13 },
  two:   { size: 40, border: 2.5, borderColor: 'rgba(255,255,255,0.4)', stars: 2, starSize: 16 },
  one:   { size: 32, border: 2,   borderColor: 'rgba(255,255,255,0.4)', stars: 1, starSize: 20 },
} as const

function mapStyle(dark: boolean) {
  return dark ? 'streets-v4-dark' : maptilersdk.MapStyle.STREETS
}

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as { center: [number, number]; zoom: number }
  } catch {}
  return DEFAULT
}

function makeWhiteStarCanvas(src: HTMLImageElement, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.drawImage(src, 0, 0, size, size)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  return c
}

function drawCircleMarker(
  starSrc: HTMLImageElement,
  size: number,
  border: number,
  borderColor: string,
  stars: number,
  starSize: number,
): ImageData {
  const dpr = window.devicePixelRatio || 1
  const px = size * dpr
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2

  ctx.beginPath()
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#cb0028'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, size / 2 - border / 2, 0, Math.PI * 2)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = border
  ctx.stroke()

  const gap = 1
  const totalW = stars * starSize + (stars - 1) * gap
  const startX = cx - totalW / 2
  const whiteStar = makeWhiteStarCanvas(starSrc, starSize)
  for (let i = 0; i < stars; i++) {
    ctx.drawImage(whiteStar, startX + i * (starSize + gap), cy - starSize / 2, starSize, starSize)
  }

  return ctx.getImageData(0, 0, px, px)
}

function drawTextMarker(size: number, text: string, fontSize: number): ImageData {
  const dpr = window.devicePixelRatio || 1
  const px = size * dpr
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2

  ctx.beginPath()
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#cb0028'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, size / 2 - 1, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)

  return ctx.getImageData(0, 0, px, px)
}

async function prepareMarkerImages(map: maptilersdk.Map): Promise<void> {
  const starSrc = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = '/etoile_michelin.png'
  })

  const dpr = window.devicePixelRatio || 1

  for (const [status, spec] of Object.entries(MARKER_SPECS) as [keyof typeof MARKER_SPECS, typeof MARKER_SPECS[keyof typeof MARKER_SPECS]][]) {
    if (!map.hasImage(`michelin-${status}`)) {
      const imageData = drawCircleMarker(starSrc, spec.size, spec.border, spec.borderColor, spec.stars, spec.starSize)
      map.addImage(`michelin-${status}`, imageData, { pixelRatio: dpr })
    }
  }

  if (!map.hasImage('michelin-bib')) {
    map.addImage('michelin-bib', drawTextMarker(26, 'Bib', 10), { pixelRatio: dpr })
  }
  if (!map.hasImage('michelin-hotel')) {
    map.addImage('michelin-hotel', drawTextMarker(24, 'H', 13), { pixelRatio: dpr })
  }
  if (!map.hasImage('michelin-none')) {
    map.addImage('michelin-none', drawTextMarker(18, '·', 11), { pixelRatio: dpr })
  }
}

function toGeoJSON(data: EstablishmentView[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: data
      .filter(e => e.lat != null && e.lng != null)
      .map(e => ({
        type: 'Feature' as const,
        id: String(e.id),
        geometry: { type: 'Point' as const, coordinates: [e.lng!, e.lat!] },
        properties: { id: e.id, status: e.michelin_status ?? '', type: e.establishment_type },
      })),
  }
}

function setupEstablishmentLayers(
  map: maptilersdk.Map,
  onClickRef: React.MutableRefObject<(e: EstablishmentView) => void>,
  establishmentsRef: React.MutableRefObject<EstablishmentView[]>,
) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
  }

  const starStatuses = ['three', 'two', 'one'] as const
  for (const status of starStatuses) {
    if (!map.getLayer(`michelin-${status}`)) {
      map.addLayer({
        id: `michelin-${status}`,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['==', ['get', 'status'], status],
        layout: {
          'icon-image': `michelin-${status}`,
          'icon-allow-overlap': true,
          'icon-anchor': 'center',
        },
      })
    }
  }

  if (!map.getLayer('michelin-bib')) {
    map.addLayer({
      id: 'michelin-bib',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['==', ['get', 'status'], 'bib'],
      layout: { 'icon-image': 'michelin-bib', 'icon-allow-overlap': true, 'icon-anchor': 'center' },
    })
  }

  if (!map.getLayer('michelin-hotel')) {
    map.addLayer({
      id: 'michelin-hotel',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['==', ['get', 'type'], 'hotel'],
      layout: { 'icon-image': 'michelin-hotel', 'icon-allow-overlap': true, 'icon-anchor': 'center' },
    })
  }

  if (!map.getLayer('michelin-none')) {
    map.addLayer({
      id: 'michelin-none',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['all',
        ['!=', ['get', 'type'], 'hotel'],
        ['!', ['in', ['get', 'status'], ['literal', ['one', 'two', 'three', 'bib']]]],
      ],
      layout: { 'icon-image': 'michelin-none', 'icon-allow-overlap': true, 'icon-anchor': 'center' },
    })
  }

  for (const layerId of CLICKABLE_LAYERS) {
    map.on('click', layerId, (e) => {
      const feature = e.features?.[0]
      if (!feature?.properties) return
      const est = establishmentsRef.current.find(r => r.id === feature.properties!.id)
      if (!est) return
      map.flyTo({ center: [est.lng!, est.lat!], zoom: 16, duration: 600 })
      onClickRef.current(est)
    })
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
  }
}

function updateEstablishmentData(map: maptilersdk.Map, data: EstablishmentView[]) {
  const source = map.getSource(SOURCE_ID) as maptilersdk.GeoJSONSource | undefined
  source?.setData(toGeoJSON(data))
}

function addUserLocationLayers(map: maptilersdk.Map, pos: [number, number]) {
  if (!map.getSource('user-location')) {
    map.addSource('user-location', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Point', coordinates: pos }, properties: {} },
    })
  }
  if (!map.getLayer('user-location-halo')) {
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
  }
  if (!map.getLayer('user-location-dot')) {
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
  }
}

async function applyStyleSetup(
  map: maptilersdk.Map,
  onClickRef: React.MutableRefObject<(e: EstablishmentView) => void>,
  establishmentsRef: React.MutableRefObject<EstablishmentView[]>,
  userPos: [number, number] | null,
) {
  map.getStyle().layers.forEach((l) => {
    const sl = (l as { 'source-layer'?: string })['source-layer']
    if (sl && HIDE_SOURCE_LAYERS.includes(sl)) {
      map.setLayoutProperty(l.id, 'visibility', 'none')
    }
  })

  await prepareMarkerImages(map)
  setupEstablishmentLayers(map, onClickRef, establishmentsRef)
  // read ref AFTER await so data arrived while loading images is picked up
  if (establishmentsRef.current.length) {
    updateEstablishmentData(map, establishmentsRef.current)
  }
  if (userPos) {
    addUserLocationLayers(map, userPos)
  }
}

interface Props {
  onEstablishmentClick: (e: EstablishmentView) => void
  flyTarget?: EstablishmentView | null
}

export function MapPage({ onEstablishmentClick, flyTarget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maptilersdk.Map | null>(null)
  const mapLoadedRef = useRef(false)
  const establishmentsRef = useRef<EstablishmentView[]>([])
  const onEstablishmentClickRef = useRef(onEstablishmentClick)
  const userPosRef = useRef<[number, number] | null>(null)
  const [located, setLocated] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(loadSavedPosition().zoom)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  themeRef.current = theme
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const { data: establishments } = useAllEstablishments()
  const bubbles = useMapReviewBubbles()
  const bubbleUserIds = bubbles.map(b => b.userId)
  const { data: avatarUrls = new Map<string, string>() } = useBatchAvatarUrls(bubbleUserIds)
  const resolveAvatar = (userId: string) =>
    avatarUrls.get(userId) ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(userId)}&size=56`

  useEffect(() => {
    if (!flyTarget?.lat || !flyTarget?.lng || !mapRef.current || !mapLoadedRef.current) return
    mapRef.current.flyTo({ center: [flyTarget.lng, flyTarget.lat], zoom: 16, duration: 600 })
  }, [flyTarget])

  useEffect(() => {
    onEstablishmentClickRef.current = onEstablishmentClick
  }, [onEstablishmentClick])

  useEffect(() => {
    if (!establishments?.length) return
    establishmentsRef.current = establishments
    if (mapRef.current && mapLoadedRef.current) {
      updateEstablishmentData(mapRef.current, establishments)
    }
  }, [establishments])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    map.once('styledata', () => {
      applyStyleSetup(map, onEstablishmentClickRef, establishmentsRef, userPosRef.current)
    })
    map.setStyle(mapStyle(theme === 'dark'))
  }, [theme])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const saved = loadSavedPosition()

    const map = new maptilersdk.Map({
      container: containerRef.current,
      style: mapStyle(themeRef.current === 'dark'),
      center: saved.center,
      zoom: saved.zoom,
      geolocateControl: false,
      navigationControl: false,
    })
    mapRef.current = map

    map.on('styleimagemissing', (e: { id: string }) => {
      map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) })
    })

    map.on('load', () => {
      mapLoadedRef.current = true

      applyStyleSetup(map, onEstablishmentClickRef, establishmentsRef, null)

      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const pos: [number, number] = [coords.longitude, coords.latitude]
        userPosRef.current = pos
        setLocated(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ center: pos, zoom: 17 }))
        addUserLocationLayers(map, pos)
      })
    })

    map.on('move', forceUpdate)
    map.on('zoom', () => setCurrentZoom(map.getZoom()))

    return () => {
      mapLoadedRef.current = false
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const showBubbles = currentZoom >= BUBBLE_ZOOM_THRESHOLD && mapRef.current && mapLoadedRef.current

  return (
    <div className="fixed inset-0 -z-10 sm:relative sm:inset-auto sm:z-auto sm:max-w-4xl sm:mx-auto sm:pt-8">
      <div
        ref={containerRef}
        className="size-full sm:h-[70vh] sm:rounded-2xl sm:overflow-hidden sm:border sm:border-border sm:shadow-lg"
      />

      {/* Overlay: same footprint as containerRef (mobile: inset-0, sm: top-8 + h-[70vh]) */}
      {showBubbles && (
        <div className="absolute inset-0 sm:inset-auto sm:top-8 sm:left-0 sm:right-0 sm:h-[70vh] pointer-events-none overflow-hidden sm:rounded-2xl">
          {bubbles.map(bubble => {
            const map = mapRef.current!
            const bounds = map.getBounds()
            if (
              bubble.lat < bounds.getSouth() || bubble.lat > bounds.getNorth() ||
              bubble.lng < bounds.getWest() || bubble.lng > bounds.getEast()
            ) return null

            const point = map.project([bubble.lng, bubble.lat])
            return (
              <ReviewBubble
                key={bubble.postId}
                bubble={bubble}
                avatarUrl={resolveAvatar(bubble.userId)}
                x={point.x}
                y={point.y}
                onClick={() => {
                  if (authUser && bubble.userId === authUser.id) navigate('/profile')
                  else navigate(`/profile/${bubble.userId}`)
                }}
              />
            )
          })}
        </div>
      )}

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