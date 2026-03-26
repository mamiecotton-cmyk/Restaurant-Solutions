'use client'

import { useEffect, useState, useCallback } from 'react'

interface Order {
  id: string
  stripe_session_id: string
  customer_email: string | null
  customer_name: string | null
  items: Array<{ name: string; quantity: number; amount: number }>
  amount_total: number
  currency: string
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '🔔 New', color: 'text-yellow-300', bg: 'bg-yellow-900/40 border-yellow-500/50' },
  preparing: { label: '🍳 Preparing', color: 'text-orange-300', bg: 'bg-orange-900/40 border-orange-500/50' },
  ready: { label: '✅ Ready', color: 'text-green-300', bg: 'bg-green-900/40 border-green-500/50' },
  completed: { label: '📦 Completed', color: 'text-gray-400', bg: 'bg-gray-800/40 border-gray-600/50' },
  cancelled: { label: '❌ Cancelled', color: 'text-red-400', bg: 'bg-red-900/40 border-red-500/50' },
}

const NEXT_STATUSES: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('active')

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000) // poll every 10s
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o))
        )
      }
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['new', 'preparing', 'ready'].includes(o.status)
    if (filter === 'all') return true
    return o.status === filter
  })

  const newCount = orders.filter((o) => o.status === 'new').length

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#D4AF37] uppercase tracking-wide">
              Order Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Wally&apos;s NW Soul &middot; {orders.length} total orders
              {newCount > 0 && (
                <span className="ml-2 bg-yellow-600 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {newCount} new
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchOrders() }}
            className="text-sm bg-[#1a1a1a] border border-white/10 text-gray-300 px-4 py-2 rounded-lg hover:border-[#D4AF37]/50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['active', 'new', 'preparing', 'ready', 'completed', 'cancelled', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-[#D4AF37]/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-600 text-sm mt-2">Orders will appear here when customers check out via Stripe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status]
              const nextStatuses = NEXT_STATUSES[order.status]
              return (
                <div
                  key={order.id}
                  className={`border rounded-2xl p-5 ${config.bg} transition-all`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-bold text-sm ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>

                      {order.customer_name && (
                        <p className="text-white font-semibold">{order.customer_name}</p>
                      )}
                      {order.customer_email && (
                        <p className="text-gray-400 text-sm">{order.customer_email}</p>
                      )}

                      {/* Items */}
                      <div className="mt-3 space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.quantity}× {item.name}
                            </span>
                            <span className="text-gray-400">
                              ${(item.amount / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex justify-between">
                        <span className="text-sm font-bold text-white">Total</span>
                        <span className="text-sm font-bold text-[#D4AF37]">
                          ${(order.amount_total / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {nextStatuses.length > 0 && (
                      <div className="flex sm:flex-col gap-2 items-start sm:items-end justify-end">
                        {nextStatuses.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
                              s === 'cancelled'
                                ? 'bg-red-900/50 text-red-300 hover:bg-red-800/60'
                                : 'bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30'
                            }`}
                          >
                            → {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order ID */}
                  <p className="text-gray-700 text-xs mt-3 font-mono">
                    {order.id}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
