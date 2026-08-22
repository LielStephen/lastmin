import React, { useState, useEffect } from 'react'
import { Plus, Package, MapPin, AlertTriangle, RefreshCw } from 'lucide-react'
import OrderTimeline from '../components/OrderTimeline'
import RescheduleModal from '../components/RescheduleModal'
import InteractiveMap from '../components/InteractiveMap'
import KiboComparison from '../components/KiboComparison'

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [logs, setLogs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [rescheduleTargetOrder, setRescheduleTargetOrder] = useState(null)

  const [newOrder, setNewOrder] = useState({
    pickupAddress: '123 Wall St, New York, NY',
    pickupLat: 40.7074,
    pickupLng: -74.0113,
    dropAddress: '456 Broadway, New York, NY',
    dropLat: 40.7191,
    dropLng: -74.0002,
    pickupZoneId: 1,
    dropZoneId: 1,
    length: 30,
    width: 20,
    height: 15,
    actualWeight: 3.5,
    clientType: 'B2C',
    paymentMethod: 'COD'
  })

  const [ratePreview, setRatePreview] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
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
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!showCreateModal) return
    const timeout = setTimeout(() => {
      fetch('/api/orders/calculate-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify(newOrder)
      })
        .then(res => res.json())
        .then(data => setRatePreview(data.calculation))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timeout)
  }, [newOrder, showCreateModal])

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify(newOrder)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      setShowCreateModal(false)
      fetchOrders()
      fetchOrderDetail(data.order.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Created': return 'badge-created'
      case 'Assigned': return 'badge-assigned'
      case 'Picked Up': return 'badge-pickedup'
      case 'In Transit': return 'badge-intransit'
      case 'Out for Delivery': return 'badge-outfordelivery'
      case 'Delivered': return 'badge-delivered'
      case 'Failed': return 'badge-failed'
      case 'Rescheduled': return 'badge-rescheduled'
      default: return 'bg-slate-800 text-slate-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between p-6 rounded-2xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-100">Customer Logistics Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Track your deliveries, calculate rates, and reschedule package attempts.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Place New Order</span>
        </button>
      </div>

      <KiboComparison
        onSelectOption={(opt) => {
          setNewOrder(prev => ({
            ...prev,
            clientType: opt.id === 'express' ? 'B2C' : 'B2B'
          }))
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-heading font-bold text-slate-200 text-base flex items-center justify-between">
            <span>Your Active Orders</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">{orders.length}</span>
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-xl glass-panel text-center text-slate-500 text-sm">
              No orders found. Click "Place New Order" to start!
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetail(order.id)}
                  className={`p-4 rounded-xl glass-panel glass-card-hover cursor-pointer border ${
                    selectedOrder?.id === order.id ? 'border-indigo-500/60 bg-indigo-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-indigo-300">#{order.tracking_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs ${getBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{order.drop_address}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-500">Price: <strong className="text-emerald-400 font-mono">${order.final_price}</strong></span>
                      <span className="text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {order.status === 'Failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setRescheduleTargetOrder(order)
                      }}
                      className="w-full mt-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                      <span>Reschedule Failed Delivery</span>
                    </button>
                  )}
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
                  <div className="flex items-center space-x-3">
                    <h3 className="font-heading font-extrabold text-xl text-slate-100">
                      Tracking #{selectedOrder.tracking_number}
                    </h3>
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${getBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Created on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Billed Charge</div>
                  <div className="font-mono text-xl font-extrabold text-emerald-400">${selectedOrder.final_price}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{selectedOrder.payment_method} Payment</div>
                </div>
              </div>

              {selectedOrder.status === 'Failed' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-start space-x-3 text-xs text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm block">Delivery Attempt Failed</span>
                      <span>Reason: {selectedOrder.failure_reason || 'Courier unable to access location.'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setRescheduleTargetOrder(selectedOrder)}
                    className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs shadow transition shrink-0"
                  >
                    Reschedule Date
                  </button>
                </div>
              )}

              <InteractiveMap
                pickupLat={selectedOrder.pickup_lat || 40.7074}
                pickupLng={selectedOrder.pickup_lng || -74.0113}
                dropLat={selectedOrder.drop_lat || 40.7191}
                dropLng={selectedOrder.drop_lng || -74.0002}
                agentLat={selectedOrder.agent_lat || 40.7128}
                agentLng={selectedOrder.agent_lng || -74.0060}
                agentName={selectedOrder.agent_name || 'Courier Agent'}
                status={selectedOrder.status}
              />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-semibold text-indigo-400 uppercase tracking-wider text-[11px]">Route Coordinates</div>
                  <div>
                    <span className="text-slate-500 block">Pickup Address:</span>
                    <span className="text-slate-200 font-medium">{selectedOrder.pickup_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Drop Address:</span>
                    <span className="text-slate-200 font-medium">{selectedOrder.drop_address}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-semibold text-purple-400 uppercase tracking-wider text-[11px]">Package Dimensions & Rates</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Actual Wt:</span>
                      <span className="text-slate-200 font-mono">{selectedOrder.actual_weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Volumetric Wt:</span>
                      <span className="text-slate-200 font-mono">{selectedOrder.volumetric_weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Billable Wt:</span>
                      <span className="text-slate-200 font-mono font-bold text-indigo-300">{selectedOrder.billable_weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Classification:</span>
                      <span className="text-slate-200 font-semibold">{selectedOrder.client_type} ({selectedOrder.is_intra_zone ? 'Intra' : 'Inter'})</span>
                    </div>
                  </div>
                </div>
              </div>

              <OrderTimeline logs={logs} currentStatus={selectedOrder.status} />

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              Select an order on the left to view live timeline.
            </div>
          )}
        </div>

      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-100">Create New Shipping Order</h3>
                  <p className="text-xs text-slate-400">Auto-calculated rate card based on volumetric weight</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pickup Address</label>
                  <input
                    type="text"
                    value={newOrder.pickupAddress}
                    onChange={e => setNewOrder({ ...newOrder, pickupAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Drop Address</label>
                  <input
                    type="text"
                    value={newOrder.dropAddress}
                    onChange={e => setNewOrder({ ...newOrder, dropAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">L (cm)</label>
                  <input
                    type="number"
                    value={newOrder.length}
                    onChange={e => setNewOrder({ ...newOrder, length: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">W (cm)</label>
                  <input
                    type="number"
                    value={newOrder.width}
                    onChange={e => setNewOrder({ ...newOrder, width: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">H (cm)</label>
                  <input
                    type="number"
                    value={newOrder.height}
                    onChange={e => setNewOrder({ ...newOrder, height: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newOrder.actualWeight}
                    onChange={e => setNewOrder({ ...newOrder, actualWeight: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Client Type</label>
                  <select
                    value={newOrder.clientType}
                    onChange={e => setNewOrder({ ...newOrder, clientType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
                  >
                    <option value="B2C">B2C Retail</option>
                    <option value="B2B">B2B Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={e => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
                  >
                    <option value="COD">COD (Cash on Delivery)</option>
                    <option value="PREPAID">PREPAID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pickup Zone</label>
                  <select
                    value={newOrder.pickupZoneId}
                    onChange={e => setNewOrder({ ...newOrder, pickupZoneId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
                  >
                    <option value={1}>Downtown Central</option>
                    <option value={2}>North Suburbs</option>
                    <option value={3}>West Industrial</option>
                  </select>
                </div>
              </div>

              {ratePreview && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Auto-Calculated Shipping Fee:</span>
                    <span className="text-[11px] text-slate-500">
                      Billable Wt: {ratePreview.billableWeight} kg (Volumetric: {ratePreview.volumetricWeight} kg)
                    </span>
                  </div>
                  <div className="font-mono text-xl font-extrabold text-emerald-400">
                    ${ratePreview.finalPrice}
                  </div>
                </div>
              )}

              {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">{error}</div>}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                >
                  {createLoading ? 'Confirming...' : 'Confirm & Place Order'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <RescheduleModal
        isOpen={!!rescheduleTargetOrder}
        onClose={() => setRescheduleTargetOrder(null)}
        order={rescheduleTargetOrder}
        onRescheduled={() => {
          fetchOrders()
          if (selectedOrder) fetchOrderDetail(selectedOrder.id)
        }}
      />

    </div>
  )
}
