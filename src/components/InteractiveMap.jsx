import React from 'react'
import { MapPin, Truck, Flag, Compass, ExternalLink } from 'lucide-react'
import { calculateHaversineDistance } from '../../server/services/geospatialService.js'

export default function InteractiveMap({
  pickupLat = 21.84,
  pickupLng = 82.79,
  dropLat = 21.85,
  dropLng = 82.82,
  agentLat = 21.845,
  agentLng = 82.805,
  agentName = 'Courier Agent',
  status = 'In Transit'
}) {
  const centerLat = agentLat || 21.84
  const centerLng = agentLng || 82.79
  const delta = 0.08

  const bbox = `${centerLng - delta},${centerLat - delta},${centerLng + delta},${centerLat + delta}`
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat},${centerLng}`
  const osmDirectLink = `https://www.openstreetmap.org/#map=13/${centerLat}/${centerLng}`

  const distanceTotal = calculateHaversineDistance(pickupLat, pickupLng, dropLat, dropLng)

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex flex-col space-y-2 p-3">
      
      <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          <span className="font-heading font-semibold text-slate-200">OpenStreetMap Live Geospatial Layer</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span>Route: <strong className="text-indigo-300">{distanceTotal} km</strong></span>
          <a
            href={osmDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-800">
        <iframe
          title="OpenStreetMap Live Tracking"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmUrl}
          className="w-full h-full filter contrast-125 brightness-90"
        />

        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pickup: ({pickupLat.toFixed(2)}, {pickupLng.toFixed(2)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Agent ({agentName}): ({agentLat.toFixed(2)}, {agentLng.toFixed(2)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dropoff: ({dropLat.toFixed(2)}, {dropLng.toFixed(2)})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pickup</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Live Courier</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Destination</span>
          </span>
        </div>
        <span className="font-mono text-slate-500">OpenStreetMap API v3</span>
      </div>

    </div>
  )
}
