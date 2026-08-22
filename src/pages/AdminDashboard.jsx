import React, { useState, useEffect } from 'react'
import { Shield, Users, Truck, Zap, CheckCircle } from 'lucide-react'
import OrderTimeline from '../components/OrderTimeline'
import InteractiveMap from '../components/InteractiveMap'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [rateCards, setRateCards] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [logs, setLogs] = useState([])
  const [toastMsg, setToastMsg] = useState('')
  const [isOverride, setIsOverride] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordRes, cardRes, agentRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` } }),
        fetch('/api/rate-cards', { headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` } }),
        fetch('/api/agents', { headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` } })
      ])

      const ordData = await ordRes.json()
      const cardData = await cardRes.json()
      const agentData = await agentRes.json()

      setOrders(ordData.orders || [])
      setRateCards(cardData.rateCards || [])
      setAgents(agentData.agents || [])

      if (ordData.orders?.length > 0 && !selectedOrder) {
        fetchOrderDetail(ordData.orders[0].id)
      }
    } catch (err) {
      console.error(err)
    } font-sans
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
    fetchData()
  }, [])

  const handleAutoAssign = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify({ autoAssign: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setToastMsg(`Auto-assigned: ${data.message}`)
      fetchData()
      if (selectedOrder?.id === orderId) fetchOrderDetail(orderId)
    } catch (err) {
      setToastMsg(`Error: ${err.message}`)
    }
  }

  const handleAdminStatusChange = async (targetStatus) => {
    if (!selectedOrder) return
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('antigravity_token')}`
        },
        body: JSON.stringify({
          status: targetStatus,
          isOverride,
          notes: `Admin status update (Override: ${isOverride})`
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setToastMsg(`Status updated to ${targetStatus}`)
      fetchData()
      fetchOrderDetail(selectedOrder.id)
    } catch (err) {
      setToastMsg(`Error: ${err.message}`)
    }
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.final_price) || 0), 0)
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length
  const activeCount = orders.filter(o => !['Delivered', 'Failed'].includes(o.status)).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between p-6 rounded-2xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-100">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">Order tracking, courier assignment, and status management.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <input
            type="checkbox"
            id="override"
            checked={isOverride}
            onChange={e => setIsOverride(e.target.checked)}
            className="rounded border-slate-700 text-rose-500 focus:ring-0"
          />
          <label htmlFor="override" className="text-slate-300 font-medium cursor-pointer">
            Force status update
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Revenue</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">₹{totalRevenue.toFixed(2)}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Orders</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono font-extrabold text-2xl text-cyan-300">{activeCount}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Delivered Packages</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-mono font-extrabold text-2xl text-purple-300">{deliveredCount}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Couriers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-extrabold text-2xl text-amber-300">{agents.length}</div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-300 flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-heading font-bold text-slate-200 text-base flex items-center justify-between">
            <span>Orders</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">{orders.length}</span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading orders...</div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetail(order.id)}
                  className={`p-4 rounded-xl glass-panel glass-card-hover cursor-pointer border ${
                    selectedOrder?.id === order.id ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-rose-300">#{order.tracking_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full font-semibold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Customer: <strong className="text-slate-300">{order.customer_name}</strong></span>
                      <span>Total: <strong className="text-emerald-400 font-mono">₹{order.final_price}</strong></span>
                    </div>

                    {order.status === 'Created' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAutoAssign(order.id)
                        }}
                        className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Auto-assign agent</span>
                      </button>
                    )}
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
                  <h3 className="font-heading font-bold text-xl text-slate-100">
                    Order #{selectedOrder.tracking_number}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status: <strong className="text-rose-400">{selectedOrder.status}</strong></p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Change status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleAdminStatusChange(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium"
                  >
                    <option value="Created">Created</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              <InteractiveMap
                pickupLat={selectedOrder.pickup_lat || 12.9716}
                pickupLng={selectedOrder.pickup_lng || 77.5946}
                dropLat={selectedOrder.drop_lat || 12.9784}
                dropLng={selectedOrder.drop_lng || 77.6408}
                agentLat={selectedOrder.agent_lat || 12.9716}
                agentLng={selectedOrder.agent_lng || 77.5946}
                agentName={selectedOrder.agent_name || 'Courier Agent'}
                status={selectedOrder.status}
              />

              <OrderTimeline logs={logs} currentStatus={selectedOrder.status} />

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              Select an order to view details.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
