'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

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

const ALL_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled']

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

function isThisWeek(dateStr: string): boolean {
  return new Date(dateStr) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr), n = new Date()
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

function calcAvgOrderTime(orders: Order[]): string {
  const eligible = orders.filter(
    (o) => (o.status === 'ready' || o.status === 'completed') && o.created_at && o.updated_at
  )
  if (eligible.length === 0) return '--'
  const totalMs = eligible.reduce((sum, o) => sum + (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()), 0)
  const avgMs = totalMs / eligible.length
  const avgMin = Math.floor(avgMs / 60000)
  const avgSec = Math.floor((avgMs % 60000) / 1000)
  if (avgMin === 0) return `${avgSec}s`
  return `${avgMin}m ${avgSec}s`
}

function exportToCSV(orders: Order[]) {
  const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Status']
  const rows = orders.map((o) => [
    o.id.slice(0, 8).toUpperCase(),
    new Date(o.created_at).toLocaleString(),
    formatName(o.customer_name),
    o.customer_email || '',
    o.items.map((i) => `${i.quantity}x ${i.name}`).join('; '),
    `$${(o.amount_total / 100).toFixed(2)}`,
    o.status,
  ])
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wallys-orders-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function OwnerPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus as Order['status'] } : o)))
      }
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  const nonCancelled = orders.filter((o) => o.status !== 'cancelled')
  const todayRevenue = nonCancelled.filter((o) => isToday(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const weekRevenue = nonCancelled.filter((o) => isThisWeek(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const monthRevenue = nonCancelled.filter((o) => isThisMonth(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const todayOrders = nonCancelled.filter((o) => isToday(o.created_at)).length
  const avgTime = calcAvgOrderTime(orders)

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return o.customer_name?.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          {/* Left */}
          <div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide mb-1">📊 Owner Dashboard</h1>
            <button onClick={() => { setLoading(true); fetchOrders() }}
              className="text-[10px] bg-[#1a1a1a] border border-white/10 text-gray-300 px-3 py-1 rounded-full">↻ Refresh</button>
          </div>

          {/* Right: View switcher + avg time box */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
            <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl px-5 py-3 text-center min-w-[140px]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Avg Order Time</p>
              <p className="text-3xl font-black text-purple-400">{avgTime}</p>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today</p>
            <p className="text-2xl font-black text-[#D4AF37]">${(todayRevenue / 100).toFixed(2)}</p>
            <p className="text-[10px] text-gray-600 mt-1">{todayOrders} orders</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Week</p>
            <p className="text-2xl font-black text-[#D4AF37]">${(weekRevenue / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Month</p>
            <p className="text-2xl font-black text-[#D4AF37]">${(monthRevenue / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-2xl font-black text-white">{orders.length}</p>
            <p className="text-[10px] text-gray-600 mt-1">{orders.filter((o) => o.status === 'cancelled').length} cancelled</p>
          </div>
        </div>

        {/* Search + Filters + Export */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input type="text" placeholder="Search name, order ID, item..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] text-sm bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
            <option value="all">ALL STATUS</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <button onClick={() => exportToCSV(filteredOrders)}
            className="text-xs font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-4 py-2 hover:bg-purple-800/50 transition-colors">
            📥 Export CSV
          </button>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">No orders found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Order</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Date</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Customer</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Items</th>
                  <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Total</th>
                  <th className="text-center text-[10px] text-gray-500 uppercase tracking-wider py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2"><span className="text-[#D4AF37] font-mono text-xs font-bold">#{order.id.slice(0, 6).toUpperCase()}</span></td>
                    <td className="py-3 px-2">
                      <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</span><br />
                      <span className="text-gray-600 text-[10px]">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-white text-xs font-semibold">{formatName(order.customer_name) || '—'}</span>
                      {order.customer_email && <><br /><span className="text-gray-600 text-[10px]">{order.customer_email}</span></>}
                    </td>
                    <td className="py-3 px-2">
                      {order.items.map((item, i) => <span key={i} className="text-gray-300 text-xs block leading-tight">{item.quantity}× {item.name}</span>)}
                    </td>
                    <td className="py-3 px-2 text-right"><span className="text-[#D4AF37] font-black text-sm">${(order.amount_total / 100).toFixed(2)}</span></td>
                    <td className="py-3 px-2 text-center">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1.5 border cursor-pointer transition-colors ${
                          order.status === 'new' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30' :
                          order.status === 'preparing' ? 'bg-orange-900/40 text-orange-300 border-orange-500/30' :
                          order.status === 'ready' ? 'bg-green-900/40 text-green-300 border-green-500/30' :
                          order.status === 'completed' ? 'bg-gray-800/40 text-gray-400 border-gray-600/30' :
                          'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}