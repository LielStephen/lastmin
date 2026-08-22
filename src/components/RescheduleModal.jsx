import React, { useState } from 'react'
import { X, Calendar, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react'

export default function RescheduleModal({ isOpen, onClose, order, onRescheduled }) {
  const [rescheduledDate, setRescheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !order) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${order.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify({ rescheduledDate, notes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule order')

      onRescheduled(data.order)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100">Reschedule Failed Delivery</h3>
              <p className="text-xs text-slate-400">Order #{order.tracking_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Previous Failure Reason:</span>
              <span>{order.failure_reason || 'Delivery attempt failed'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select New Delivery Date</label>
            <input
              type="date"
              value={rescheduledDate}
              onChange={e => setRescheduledDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Instructions / Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Please leave package at gate code 4920 or call before arrival"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs">
            ✨ Submitting this form will automatically trigger <strong>Haversine Geospatial Auto-Reassignment</strong> to assign the nearest available delivery agent for your new date.
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold flex items-center space-x-2 transition shadow-lg shadow-pink-600/20"
            >
              {loading ? (
                <span>Reassigning Agent...</span>
              ) : (
                <>
                  <span>Confirm Reschedule</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
