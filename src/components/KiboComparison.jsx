import React, { useState } from 'react'
import { Check, Zap, Package } from 'lucide-react'

export default function KiboComparison({ onSelectOption }) {
  const [selectedPlan, setSelectedPlan] = useState('express')

  const options = [
    {
      id: 'standard',
      name: 'Standard Ground',
      price: '₹50.00',
      perKg: '₹15.00 / kg',
      eta: '24-48 Hours',
      features: [
        'Nearest Courier Auto-Dispatch',
        'SMS & Email Notifications',
        'Volumetric Weight Billing',
        '2 Retry Delivery Attempts'
      ],
      icon: Package,
      gradient: 'from-slate-800 to-slate-900',
      border: 'border-slate-700'
    },
    {
      id: 'express',
      name: 'Express Priority',
      price: '₹90.00',
      perKg: '₹25.00 / kg',
      eta: '2-4 Hours Same Day',
      features: [
        'Dedicated Priority Agent',
        'Live OpenStreetMap Tracking',
        'Immutable Audit Trail',
        'Instant Delivery Reschedule',
        'Discounted COD Surcharge'
      ],
      icon: Zap,
      gradient: 'from-indigo-950/60 via-purple-950/40 to-slate-900',
      border: 'border-indigo-500/50'
    }
  ]

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-slate-200">Select Shipping Service Tier</h3>
        <span className="text-xs font-mono text-slate-400">Rate Calculator (INR)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon
          const isSelected = selectedPlan === opt.id

          return (
            <div
              key={opt.id}
              onClick={() => {
                setSelectedPlan(opt.id)
                if (onSelectOption) onSelectOption(opt)
              }}
              className={`p-5 rounded-2xl bg-gradient-to-b ${opt.gradient} border ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl' : opt.border
              } cursor-pointer transition-all duration-200 glass-card-hover flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-100">{opt.name}</h4>
                    <span className="text-xs text-indigo-300 font-semibold">{opt.eta}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-baseline space-x-2">
                  <span className="font-mono font-extrabold text-2xl text-slate-100">{opt.price}</span>
                  <span className="text-xs text-slate-400">base ({opt.perKg})</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                {opt.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                  isSelected
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSelected ? 'Selected Service' : 'Select Plan'}
              </button>

            </div>
          )
        })}
      </div>

    </div>
  )
}
