import React, { useState, useEffect } from 'react'
import { Truck, MapPin, CheckCircle2, AlertOctagon, RefreshCw, Send, Navigation } from 'lucide-react'
import OrderTimeline from '../components/OrderTimeline'
import InteractiveMap from '../components/InteractiveMap'

export default function AgentDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [logs, setLogs] = useState([])
  
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 })
  const [statusMsg, setStatusMsg] = useState('')
  const [failureModalOpen, setFailureModalOpen] = useState(false)
  const [failureReason, setFailureReason] = useState('Customer address unreachable (security gate locked)')

  const fetchAssignedOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` }
      })
      const data = await res.json()
      setOrders(data.orders || [])
      if (data.orders?.length > 0 && !selectedOrder) {
        fetchOrderDetail(data.orders[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetail = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` }
      })
      const data = await res.json()
      setSelectedOrder(data.order)
      setLogs(data.logs || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAssignedOrders()
  }, [])

  const handleUpdateStatus = async (targetStatus, reason = '') => {
    if (!selectedOrder) return
    setStatusMsg('')
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify({
          status: targetStatus,
          failureReason: reason,
          notes: `Courier location: (${coords.lat}, ${coords.lng})`
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Status update failed')

      setStatusMsg(`Success: Status updated to ${targetStatus}`)
      setFailureModalOpen(false)
      fetchAssignedOrders()
      fetchOrderDetail(selectedOrder.id)
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`)
    }
  }

  const handleUpdateLocation = async () => {
    try {
      const res = await fetch('/api/agent/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng, status: 'available' })
      })
      if (res.ok) setStatusMsg('GPS Position updated in dispatch engine!')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between p-6 rounded-2xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-100">Courier Task Matrix</h1>
            <p className="text-sm text-slate-400">Manage order status transitions and broadcast live GPS coordinates.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
          <Navigation className="w-4 h-4 text-amber-400" />
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.0001"
              value={coords.lat}
              onChange={e => setCoords({ ...coords, lat: parseFloat(e.target.value) })}
              className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
            />
            <input
              type="number"
              step="0.0001"
              value={coords.lng}
              onChange={e => setCoords({ ...coords, lng: parseFloat(e.target.value) })}
              className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
            />
            <button
              onClick={handleUpdateLocation}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
            >
              Update GPS
            </button>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-semibold border ${
          statusMsg.startsWith('Error') ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-heading font-bold text-slate-200 text-base flex items-center justify-between">
            <span>Assigned Tasks</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">{orders.length}</span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading tasks...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-xl glass-panel text-center text-slate-500 text-sm">
              No active deliveries assigned to you.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetail(order.id)}
                  className={`p-4 rounded-xl glass-panel glass-card-hover cursor-pointer border ${
                    selectedOrder?.id === order.id ? 'border-amber-500/60 bg-amber-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-amber-300">#{order.tracking_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full font-semibold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{order.drop_address}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-500">Weight: <strong className="text-slate-200">{order.billable_weight} kg</strong></span>
                      <span className="text-slate-500">Method: <strong className="text-emerald-400">{order.payment_method}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-slate-100">
                    Order #{selectedOrder.tracking_number}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Current Status: <strong className="text-amber-400">{selectedOrder.status}</strong></p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedOrder.status === 'Assigned' && (
                    <button
                      onClick={() => handleUpdateStatus('Picked Up')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Pickup</span>
                    </button>
                  )}

                  {selectedOrder.status === 'Picked Up' && (
                    <button
                      onClick={() => handleUpdateStatus('In Transit')}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Start Transit</span>
                    </button>
                  )}

                  {selectedOrder.status === 'In Transit' && (
                    <button
                      onClick={() => handleUpdateStatus('Out for Delivery')}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Out for Delivery</span>
                    </button>
                  )}

                  {selectedOrder.status === 'Out for Delivery' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('Delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered</span>
                      </button>

                      <button
                        onClick={() => setFailureModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition flex items-center space-x-1"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Mark Failed</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <InteractiveMap
                pickupLat={selectedOrder.pickup_lat || 40.7074}
                pickupLng={selectedOrder.pickup_lng || -74.0113}
                dropLat={selectedOrder.drop_lat || 40.7191}
                dropLng={selectedOrder.drop_lng || -74.0002}
                agentLat={coords.lat}
                agentLng={coords.lng}
                agentName="Your Location"
                status={selectedOrder.status}
              />

              <OrderTimeline logs={logs} currentStatus={selectedOrder.status} />

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              Select an assigned task to inspect details and execute state transitions.
            </div>
          )}
        </div>

      </div>

      {failureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading font-bold text-lg text-rose-400 flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5" />
              <span>Record Failed Delivery</span>
            </h3>

            <div className="text-xs text-slate-400">
              Please enter the specific reason why delivery could not be completed.
            </div>

            <textarea
              value={failureReason}
              onChange={e => setFailureReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setFailureModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus('Failed', failureReason)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Failure State
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
