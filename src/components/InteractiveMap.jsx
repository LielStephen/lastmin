import React from 'react'
import { MapPin, Truck, Flag, Compass } from 'lucide-react'
import { calculateHaversineDistance } from '../../server/services/geospatialService.js'

export default function InteractiveMap({
  pickupLat = 40.7074,
  pickupLng = -74.0113,
  dropLat = 40.7191,
  dropLng = -74.0002,
  agentLat = 40.7128,
  agentLng = -74.0060,
  agentName = 'Courier Agent',
  status = 'In Transit'
}) {
  const latMin = 40.68
  const latMax = 40.85
  const lngMin = -74.15
  const lngMax = -73.90

  const toPercent = (lat, lng) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100
    const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100
    return {
      x: Math.min(Math.max(x, 10), 90),
      y: Math.min(Math.max(y, 10), 90)
    }
  }

  const pickupPos = toPercent(pickupLat, pickupLng)
  const dropPos = toPercent(dropLat, dropLng)
  const agentPos = toPercent(agentLat, agentLng)

  const distancePickupToAgent = calculateHaversineDistance(pickupLat, pickupLng, agentLat, agentLng)
  const distanceTotal = calculateHaversineDistance(pickupLat, pickupLng, dropLat, dropLng)

  return (
    <div className="relative w-full h-64 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner p-4 flex flex-col justify-between">
      
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          <span className="font-heading font-semibold text-slate-200">Geospatial Dispatch Visualizer</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span>Route: <strong className="text-indigo-300">{distanceTotal} km</strong></span>
          <span>Agent Dist: <strong className="text-amber-300">{distancePickupToAgent} km</strong></span>
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line
          x1={`${pickupPos.x}%`}
          y1={`${pickupPos.y}%`}
          x2={`${agentPos.x}%`}
          y2={`${agentPos.y}%`}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-pulse"
        />

        <line
          x1={`${agentPos.x}%`}
          y1={`${agentPos.y}%`}
          x2={`${dropPos.x}%`}
          y2={`${dropPos.y}%`}
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      </svg>

      <div
        style={{ left: `${pickupPos.x}%`, top: `${pickupPos.y}%` }}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <MapPin className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 shadow">
          Pickup
        </span>
      </div>

      <div
        style={{ left: `${agentPos.x}%`, top: `${agentPos.y}%` }}
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/40 animate-bounce">
          <Truck className="w-4 h-4 text-amber-300" />
        </div>
        <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[10px] font-bold border border-amber-500/30 shadow flex items-center space-x-1">
          <span>{agentName}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </span>
      </div>

      <div
        style={{ left: `${dropPos.x}%`, top: `${dropPos.y}%` }}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Flag className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 shadow">
          Destination
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pickup Point</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Live Agent</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Dropoff Point</span>
          </span>
        </div>
        <span className="font-mono text-slate-500">Haversine GIS</span>
      </div>

    </div>
  )
}
