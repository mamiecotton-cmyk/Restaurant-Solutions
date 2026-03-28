'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  customer_name: string | null
  items: Array<{ name: string; quantity: number; amount: number }>
  amount_total: number
  status: string
  created_at: string
  updated_at: string
}

function calcAvgOrderTime(orders: Order[], resetAfter: string | null): string {
  const cutoff = resetAfter ? new Date(resetAfter).getTime() : 0
  const eligible = orders.filter(
    (o) => (o.status === 'ready' || o.status === 'completed') && o.created_at && o.updated_at &&
      new Date(o.created_at).getTime() >= cutoff && new Date(o.updated_at).getTime() >= cutoff
  )
  if (eligible.length === 0) return '--'
  const totalMs = eligible.reduce((sum, o) => sum + (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()), 0)
  const avgMs = totalMs / eligible.length
  const avgMin = Math.floor(avgMs / 60000)
  const avgSec = Math.floor((avgMs % 60000) / 1000)
  if (avgMin === 0) return `${avgSec}s`
  return `${avgMin}m ${avgSec}s`
}

function calcCurrentWait(orders: Order[], now: number): string {
  const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'preparing')
  if (activeOrders.length === 0) return '--'
  const oldest = activeOrders.reduce((a, b) => new Date(a.created_at).getTime() < new Date(b.created_at).getTime() ? a : b)
  const waitMs = now - new Date(oldest.created_at).getTime()
  const waitMin = Math.floor(waitMs / 60000)
  const waitSec = Math.floor((waitMs % 60000) / 1000)
  if (waitMin === 0) return `${waitSec}s`
  return `${waitMin}m ${waitSec}s`
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export default function OwnerPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [resetAfter, setResetAfter] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [menuCount, setMenuCount] = useState(0)
  const [unavailableCount, setUnavailableCount] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(timer)
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [ordersRes, settingsRes, menuRes] = await Promise.all([
        fetch('/api/orders'), fetch('/api/settings'), fetch('/api/menu'),
      ])
      const ordersData = await ordersRes.json()
      const settingsData = await settingsRes.json()
      const menuData = await menuRes.json()
      if (Array.isArray(ordersData)) setOrders(ordersData)
      if (settingsData.value) setResetAfter(settingsData.value)
      if (Array.isArray(menuData)) {
        setMenuCount(menuData.length)
        setUnavailableCount(menuData.filter((m: any) => !m.available).length)
      }
    } catch (err) { console.error('Failed to fetch:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const resetAvgTime = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/settings', { method: 'POST' })
      const data = await res.json()
      if (data.value) setResetAfter(data.value)
    } catch (err) { console.error('Failed to reset:', err) }
    finally { setResetting(false) }
  }

  const nonCancelled = orders.filter((o) => o.status !== 'cancelled')
  const todayRevenue = nonCancelled.filter((o) => isToday(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const todayOrders = nonCancelled.filter((o) => isToday(o.created_at)).length
  const avgTime = calcAvgOrderTime(orders, resetAfter)
  const currentWait = calcCurrentWait(orders, now)
  const newCount = orders.filter((o) => o.status === 'new').length
  const prepCount = orders.filter((o) => o.status === 'preparing').length
  const readyCount = orders.filter((o) => o.status === 'ready').length
  const completedToday = orders.filter((o) => o.status === 'completed' && isToday(o.created_at)).length

  const recentOrders = orders.slice(0, 5)

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide mb-1">📊 Owner Dashboard</h1>
            <div className="flex gap-2 mt-2">
              <Link href="/owner/orders" className="text-[10px] font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:border-purple-500/40 transition-colors">📦 Orders</Link>
              <Link href="/owner/earnings" className="text-[10px] font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:border-purple-500/40 transition-colors">💰 Earnings</Link>
              <Link href="/owner/menu" className="text-[10px] font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:border-purple-500/40 transition-colors">🍽️ Menu</Link>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
              <Link href="/settings" className="ml-auto text-lg" title="Settings">⚙️</Link>
            </div>
            <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl px-5 py-3 text-center min-w-[140px]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Avg Order Time</p>
              <p className="text-3xl font-black text-purple-400">{avgTime}</p>
              <button onClick={resetAvgTime} disabled={resetting}
                className="mt-2 text-[9px] font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-3 py-1 hover:bg-purple-800/50 transition-colors disabled:opacity-50">
                {resetting ? 'Resetting...' : '↻ Reset Timer'}
              </button>
            </div>
            <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl px-5 py-3 text-center min-w-[140px]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Current Wait</p>
              <p className="text-3xl font-black text-red-400">{currentWait}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today Revenue</p>
            <p className="text-2xl font-black text-[#D4AF37]">${(todayRevenue / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today Orders</p>
            <p className="text-2xl font-black text-white">{todayOrders}</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-[10px] text-yellow-400 uppercase tracking-wider mb-1">New</p>
            <p className="text-2xl font-black text-yellow-300">{newCount}</p>
          </div>
          <div className="bg-orange-900/20 border border-orange-500/20 rounded-xl p-4">
            <p className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Preparing</p>
            <p className="text-2xl font-black text-orange-300">{prepCount}</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
            <p className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Ready</p>
            <p className="text-2xl font-black text-green-300">{readyCount}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Completed Today</p>
            <p className="text-2xl font-black text-gray-300">{completedToday}</p>
          </div>
        </div>

        {/* Quick Links Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="/owner/orders" className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase">📦 Order Management</h3>
              <span className="text-gray-600 group-hover:text-purple-400 transition-colors">→</span>
            </div>
            <p className="text-xs text-gray-500">Search, filter, manage status, export CSV</p>
            <p className="text-[10px] text-gray-600 mt-2">{orders.length} total orders</p>
          </Link>

          <Link href="/owner/earnings" className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase">💰 Earnings</h3>
              <span className="text-gray-600 group-hover:text-purple-400 transition-colors">→</span>
            </div>
            <p className="text-xs text-gray-500">Revenue breakdown by day, week, month</p>
            <p className="text-[10px] text-[#D4AF37] mt-2">${(todayRevenue / 100).toFixed(2)} today</p>
          </Link>

          <Link href="/owner/menu" className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase">🍽️ Menu Management</h3>
              <span className="text-gray-600 group-hover:text-purple-400 transition-colors">→</span>
            </div>
            <p className="text-xs text-gray-500">Edit items, prices, images, availability</p>
            <p className="text-[10px] text-gray-600 mt-2">{menuCount} items{unavailableCount > 0 ? ` · ${unavailableCount} sold out` : ''}</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wide">Recent Orders</h2>
            <Link href="/owner/orders" className="text-[10px] font-bold uppercase text-purple-400 hover:text-purple-300 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <p className="text-gray-500 text-sm py-4 text-center">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4AF37] font-mono text-xs font-bold">#{order.id.slice(0, 6).toUpperCase()}</span>
                    <span className="text-white text-xs">{formatName(order.customer_name) || '—'}</span>
                    <span className="text-gray-500 text-[10px]">{order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4AF37] text-xs font-bold">${(order.amount_total / 100).toFixed(2)}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.status === 'new' ? 'bg-yellow-900/40 text-yellow-300' :
                      order.status === 'preparing' ? 'bg-orange-900/40 text-orange-300' :
                      order.status === 'ready' ? 'bg-green-900/40 text-green-300' :
                      order.status === 'completed' ? 'bg-gray-800/40 text-gray-400' :
                      'bg-red-900/40 text-red-400'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
