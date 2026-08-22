import React, { useState } from 'react'
import { X, Calculator, ArrowRight, CheckCircle, Package } from 'lucide-react'

export default function RateCalculatorModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    length: 40,
    width: 30,
    height: 25,
    actualWeight: 5,
    clientType: 'B2C',
    pickupZoneId: 1,
    dropZoneId: 1,
    paymentMethod: 'COD'
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleCalculate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders/calculate-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100">Rate Engine Strategy Pattern</h3>
              <p className="text-xs text-slate-400">Live Volumetric Weight & Surcharge Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleCalculate} className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Length (cm)</label>
              <input
                type="number"
                value={form.length}
                onChange={e => setForm({ ...form, length: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Width (cm)</label>
              <input
                type="number"
                value={form.width}
                onChange={e => setForm({ ...form, width: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Height (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => setForm({ ...form, height: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Actual Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.actualWeight}
                onChange={e => setForm({ ...form, actualWeight: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Client Classification</label>
              <select
                value={form.clientType}
                onChange={e => setForm({ ...form, clientType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="B2C">B2C Retail Customer</option>
                <option value="B2B">B2B Corporate Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="PREPAID">PREPAID (Card/UPI)</option>
                <option value="COD">COD (Cash on Delivery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Pickup Zone</label>
              <select
                value={form.pickupZoneId}
                onChange={e => setForm({ ...form, pickupZoneId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value={1}>Downtown Central (Zone 1)</option>
                <option value={2}>North Suburbs (Zone 2)</option>
                <option value={3}>West Industrial (Zone 3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Drop Zone</label>
              <select
                value={form.dropZoneId}
                onChange={e => setForm({ ...form, dropZoneId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value={1}>Downtown Central (Zone 1)</option>
                <option value={2}>North Suburbs (Zone 2)</option>
                <option value={3}>West Industrial (Zone 3)</option>
              </select>
            </div>

            <div className="col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <span>Calculating...</span>
                ) : (
                  <>
                    <span>Execute Strategy Pattern</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

          {/* Results Breakdown */}
          {result && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Calculation Breakdown</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {result.isIntraZone ? 'Intra-Zone Rate' : 'Inter-Zone Rate'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Volumetric Wt</div>
                  <div className="font-bold text-slate-200 mt-1">{result.calculation.volumetricWeight} kg</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Actual Wt</div>
                  <div className="font-bold text-slate-200 mt-1">{form.actualWeight} kg</div>
                </div>
                <div className="p-2 rounded bg-indigo-950/50 border border-indigo-800/40">
                  <div className="text-indigo-300 font-medium">Billable Wt</div>
                  <div className="font-extrabold text-indigo-200 mt-1">{result.calculation.billableWeight} kg</div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-900">
                <div className="flex justify-between">
                  <span>Base Zone Charge:</span>
                  <span className="font-mono">${result.calculation.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight Charge (${result.rateCard.per_kg_rate}/kg):</span>
                  <span className="font-mono">${result.calculation.weightCharge}</span>
                </div>
                {result.calculation.codSurcharge > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>COD Surcharge ({result.rateCard.cod_surcharge_percent}%):</span>
                    <span className="font-mono">+${result.calculation.codSurcharge}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Final Calculated Charge:</span>
                  <span className="font-mono text-base">${result.calculation.finalPrice}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
