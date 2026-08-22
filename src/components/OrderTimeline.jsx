import React from 'react'
import { CheckCircle2, Clock, AlertCircle, RefreshCw, User, Shield, Truck } from 'lucide-react'

export default function OrderTimeline({ logs = [], currentStatus }) {
  const getActorIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-3.5 h-3.5 text-rose-400" />
      case 'agent': return <Truck className="w-3.5 h-3.5 text-amber-400" />
      default: return <User className="w-3.5 h-3.5 text-indigo-400" />
    }
  }

  const getStatusBadgeClass = (status) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="font-heading font-semibold text-slate-200 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Immutable Audit Ledger History</span>
        </h4>
        <span className="text-xs text-slate-400 font-mono">
          Total Logs: {logs.length}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">No status logs recorded yet.</div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="relative group">
              
              {/* Point indicator */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow">
                {log.to_status === 'Delivered' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : log.to_status === 'Failed' ? (
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                ) : log.to_status === 'Rescheduled' ? (
                  <RefreshCw className="w-3 h-3 text-pink-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </div>

              {/* Log Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {log.from_status && (
                      <>
                        <span className="text-slate-400 font-mono">{log.from_status}</span>
                        <span className="text-slate-600">➔</span>
                      </>
                    )}
                    <span className={`px-2 py-0.5 rounded font-semibold text-xs ${getStatusBadgeClass(log.to_status)}`}>
                      {log.to_status}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                {log.notes && (
                  <p className="text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-900">
                    {log.notes}
                  </p>
                )}

                <div className="flex items-center space-x-2 text-slate-400 text-[11px] pt-1">
                  <div className="flex items-center space-x-1">
                    {getActorIcon(log.actor_role)}
                    <span className="font-medium text-slate-300">{log.actor_name || 'System Auto-Trigger'}</span>
                  </div>
                  <span>•</span>
                  <span className="capitalize">{log.actor_role || 'System'}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
