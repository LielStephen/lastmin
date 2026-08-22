import React, { useState, useEffect } from 'react'
import { Calculator, X, Sparkles, CheckCircle2 } from 'lucide-react'

export default function RateCalculatorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    length: 30,
    width: 20,
    height: 15,
    actualWeight: 3.5,
    clientType: 'B2C',
    paymentMethod: 'COD',
    pickupZoneId: 1,
    dropZoneId: 1
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetch('/api/orders/calculate-rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => setResult(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [formData, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100">Shipping Rate Calculator (INR)</h3>
              <p className="text-xs text-slate-400">Calculate billable weight & COD charges in Rupees (₹)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Length (cm)</label>
            <input
              type="number"
              value={formData.length}
              onChange={e => setFormData({ ...formData, length: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Width (cm)</label>
            <input
              type="number"
              value={formData.width}
              onChange={e => setFormData({ ...formData, width: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Actual Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.actualWeight}
              onChange={e => setFormData({ ...formData, actualWeight: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Client Type</label>
            <select
              value={formData.clientType}
              onChange={e => setFormData({ ...formData, clientType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              <option value="B2C">B2C Retail</option>
              <option value="B2B">B2B Corporate</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="PREPAID">Prepaid</option>
            </select>
          </div>
        </div>

        {result && result.calculation && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Volumetric Weight Formula:</span>
              <span className="font-mono text-indigo-300">({formData.length} × {formData.width} × {formData.height}) / 5000 = {result.calculation.volumetricWeight} kg</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Base Rate</span>
                <span className="font-mono text-slate-200">₹{result.calculation.basePrice}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Weight Charge</span>
                <span className="font-mono text-slate-200">₹{result.calculation.weightCharge}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">COD Surcharge</span>
                <span className="font-mono text-amber-300">₹{result.calculation.codSurcharge}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-300 font-semibold text-xs">Total Billable Amount:</span>
              <span className="font-mono font-extrabold text-2xl text-emerald-400">₹{result.calculation.finalPrice}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
