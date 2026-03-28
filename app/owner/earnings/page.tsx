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
}

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function startOfDay(d: Date): Date { const n = new Date(d); n.setHours(0,0,0,0); return n }
function endOfDay(d: Date): Date { const n = new Date(d); n.setHours(23,59,59,999); return n }

function getPresetRange(preset: string): { start: Date; end: Date; label: string } {
  const now = new Date()
  const today = startOfDay(now)
  const endToday = endOfDay(now)

  switch (preset) {
    case 'today':
      return { start: today, end: endToday, label: 'Today' }
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { start: y, end: endOfDay(y), label: 'Yesterday' }
    }
    case 'last7': {
      const s = new Date(today); s.setDate(s.getDate() - 6)
      return { start: s, end: endToday, label: 'Last 7 Days' }
    }
    case 'last30': {
      const s = new Date(today); s.setDate(s.getDate() - 29)
      return { start: s, end: endToday, label: 'Last 30 Days' }
    }
    case 'thisWeek': {
      const day = now.getDay()
      const s = new Date(today); s.setDate(s.getDate() - day)
      return { start: s, end: endToday, label: 'This Week' }
    }
    case 'lastWeek': {
      const day = now.getDay()
      const endLW = new Date(today); endLW.setDate(endLW.getDate() - day - 1)
      const startLW = new Date(endLW); startLW.setDate(startLW.getDate() - 6)
      return { start: startOfDay(startLW), end: endOfDay(endLW), label: 'Last Week' }
    }
    case 'thisMonth': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: s, end: endToday, label: 'This Month' }
    }
    case 'lastMonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: s, end: endOfDay(e), label: 'Last Month' }
    }
    case 'thisYear': {
      const s = new Date(now.getFullYear(), 0, 1)
      return { start: s, end: endToday, label: 'This Year' }
    }
    case 'allTime':
      return { start: new Date(2020, 0, 1), end: endToday, label: 'All Time' }
    default:
      return { start: today, end: endToday, label: 'Today' }
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function EarningsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders(); const i = setInterval(fetchOrders, 30000); return () => clearInterval(i) }, [fetchOrders])

  // Determine date range
  let rangeStart: Date, rangeEnd: Date, rangeLabel: string
  if (isCustom && customStart && customEnd) {
    rangeStart = startOfDay(new Date(customStart + 'T00:00:00'))
    rangeEnd = endOfDay(new Date(customEnd + 'T00:00:00'))
    rangeLabel = `${customStart} — ${customEnd}`
  } else {
    const r = getPresetRange(preset)
    rangeStart = r.start
    rangeEnd = r.end
    rangeLabel = r.label
  }

  const handlePreset = (p: string) => {
    setPreset(p)
    setIsCustom(false)
    setCustomStart('')
    setCustomEnd('')
  }

  const handleCustom = () => {
    if (customStart && customEnd) {
      setIsCustom(true)
    }
  }

  // Filter orders by range
  const nonCancelled = orders.filter(o => o.status !== 'cancelled')
  const rangeOrders = nonCancelled.filter(o => {
    const d = new Date(o.created_at)
    return d >= rangeStart && d <= rangeEnd
  })

  const totalRevenue = rangeOrders.reduce((s, o) => s + o.amount_total, 0)
  const orderCount = rangeOrders.length
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0
  const cancelledInRange = orders.filter(o => o.status === 'cancelled' && new Date(o.created_at) >= rangeStart && new Date(o.created_at) <= rangeEnd).length

  // Top items in range
  const itemCounts: Record<string, { count: number; revenue: number }> = {}
  rangeOrders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 }
      itemCounts[item.name].count += item.quantity
      itemCounts[item.name].revenue += item.amount
    })
  })
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 10)

  // Daily breakdown for the range
  const dailyMap: Record<string, { revenue: number; count: number }> = {}
  rangeOrders.forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString()
    if (!dailyMap[day]) dailyMap[day] = { revenue: 0, count: 0 }
    dailyMap[day].revenue += o.amount_total
    dailyMap[day].count += 1
  })
  const dailyBreakdown = Object.entries(dailyMap).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())

  // Quick comparison cards
  const todayOrders = nonCancelled.filter(o => {
    const d = new Date(o.created_at); const n = new Date()
    return d.toDateString() === n.toDateString()
  })
  const todayRev = todayOrders.reduce((s, o) => s + o.amount_total, 0)

  const PRESETS = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7', label: 'Last 7 Days' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'lastWeek', label: 'Last Week' },
    { key: 'last30', label: 'Last 30 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'allTime', label: 'All Time' },
  ]

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/owner" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">← Dashboard</Link>
            </div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide">💰 Earnings</h1>
            <p className="text-xs text-gray-500 mt-1">Viewing: {rangeLabel}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 mb-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Select Date Range</p>
          {/* Preset buttons */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {PRESETS.map(p => (
              <button key={p.key} onClick={() => handlePreset(p.key)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-colors ${
                  !isCustom && preset === p.key
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-[#0a0a0a] text-gray-400 border-white/10 hover:border-purple-500/40'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          {/* Custom date range */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Custom:</p>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="text-xs bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500/50" />
            <span className="text-gray-600 text-xs">to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="text-xs bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-purple-500/50" />
            <button onClick={handleCustom} disabled={!customStart || !customEnd}
              className="text-[10px] font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-4 py-1.5 hover:bg-purple-800/50 transition-colors disabled:opacity-30">
              Apply
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading earnings...</div>
        ) : (
          <>
            {/* Revenue Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Revenue ({rangeLabel})</p>
                <p className="text-2xl font-black text-[#D4AF37]">${(totalRevenue / 100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{orderCount} orders</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Order Value</p>
                <p className="text-2xl font-black text-white">${(avgOrder / 100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cancelled</p>
                <p className="text-2xl font-black text-red-400">{cancelledInRange}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today (Quick)</p>
                <p className="text-2xl font-black text-[#D4AF37]">${(todayRev / 100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{todayOrders.length} orders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Breakdown */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">Daily Breakdown</h2>
                {dailyBreakdown.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">No orders in this range</p>
                ) : (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {dailyBreakdown.map(([day, data]) => {
                      const pct = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
                      return (
                        <div key={day} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                          <span className="text-gray-400 text-xs w-24 flex-shrink-0">{day}</span>
                          <div className="flex-1 bg-[#0a0a0a] rounded-full h-4 overflow-hidden">
                            <div className="h-full bg-[#D4AF37]/60 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="text-[#D4AF37] text-xs font-bold w-20 text-right">${(data.revenue / 100).toFixed(2)}</span>
                          <span className="text-gray-600 text-[10px] w-16 text-right">{data.count} orders</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Top Selling Items */}
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">Top Items ({rangeLabel})</h2>
                {topItems.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">No orders in this range</p>
                ) : (
                  <div className="space-y-2">
                    {topItems.map(([name, data], i) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 text-xs font-bold w-5">#{i + 1}</span>
                          <span className="text-white text-sm font-semibold">{name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-xs">{data.count} sold</span>
                          <span className="text-[#D4AF37] text-sm font-bold">${(data.revenue / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Orders in Range - compact list */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wide">Orders in Range</h2>
                <span className="text-[10px] text-gray-500">{rangeOrders.length} orders</span>
              </div>
              {rangeOrders.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No orders in this range</p>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {rangeOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[#D4AF37] font-mono text-[10px] font-bold">#{order.id.slice(0, 6).toUpperCase()}</span>
                        <span className="text-white text-xs">{formatName(order.customer_name) || '—'}</span>
                        <span className="text-gray-600 text-[10px]">{order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-[10px]">{new Date(order.created_at).toLocaleString()}</span>
                        <span className="text-[#D4AF37] text-xs font-bold">${(order.amount_total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}