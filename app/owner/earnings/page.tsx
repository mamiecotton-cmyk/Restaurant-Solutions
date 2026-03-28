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

function isToday(d: string) { return new Date(d).toDateString() === new Date().toDateString() }
function isYesterday(d: string) { const y = new Date(); y.setDate(y.getDate()-1); return new Date(d).toDateString() === y.toDateString() }
function isThisWeek(d: string) { return new Date(d) >= new Date(Date.now() - 7*24*60*60*1000) }
function isThisMonth(d: string) { const a = new Date(d), b = new Date(); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() }
function isLastMonth(d: string) { const a = new Date(d), b = new Date(); b.setMonth(b.getMonth()-1); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() }

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export default function EarningsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders(); const i = setInterval(fetchOrders, 30000); return () => clearInterval(i) }, [fetchOrders])

  const nonCancelled = orders.filter(o => o.status !== 'cancelled')
  const todayRev = nonCancelled.filter(o => isToday(o.created_at)).reduce((s,o) => s+o.amount_total, 0)
  const yesterdayRev = nonCancelled.filter(o => isYesterday(o.created_at)).reduce((s,o) => s+o.amount_total, 0)
  const weekRev = nonCancelled.filter(o => isThisWeek(o.created_at)).reduce((s,o) => s+o.amount_total, 0)
  const monthRev = nonCancelled.filter(o => isThisMonth(o.created_at)).reduce((s,o) => s+o.amount_total, 0)
  const lastMonthRev = nonCancelled.filter(o => isLastMonth(o.created_at)).reduce((s,o) => s+o.amount_total, 0)
  const allTimeRev = nonCancelled.reduce((s,o) => s+o.amount_total, 0)

  const todayCount = nonCancelled.filter(o => isToday(o.created_at)).length
  const weekCount = nonCancelled.filter(o => isThisWeek(o.created_at)).length
  const monthCount = nonCancelled.filter(o => isThisMonth(o.created_at)).length
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length

  const todayAvg = todayCount > 0 ? todayRev / todayCount : 0
  const weekAvg = weekCount > 0 ? weekRev / weekCount : 0
  const monthAvg = monthCount > 0 ? monthRev / monthCount : 0

  // Top items this week
  const itemCounts: Record<string, { count: number; revenue: number }> = {}
  nonCancelled.filter(o => isThisWeek(o.created_at)).forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 }
      itemCounts[item.name].count += item.quantity
      itemCounts[item.name].revenue += item.amount
    })
  })
  const topItems = Object.entries(itemCounts).sort((a,b) => b[1].count - a[1].count).slice(0, 5)

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/owner" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">← Dashboard</Link>
            </div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide">💰 Earnings</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading earnings...</div>
        ) : (
          <>
            {/* Revenue Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today</p>
                <p className="text-2xl font-black text-[#D4AF37]">${(todayRev/100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{todayCount} orders</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Yesterday</p>
                <p className="text-2xl font-black text-gray-300">${(yesterdayRev/100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Week</p>
                <p className="text-2xl font-black text-[#D4AF37]">${(weekRev/100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{weekCount} orders</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Month</p>
                <p className="text-2xl font-black text-[#D4AF37]">${(monthRev/100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{monthCount} orders</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Month</p>
                <p className="text-2xl font-black text-gray-300">${(lastMonthRev/100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">All Time</p>
                <p className="text-2xl font-black text-white">${(allTimeRev/100).toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-1">{nonCancelled.length} orders</p>
              </div>
            </div>

            {/* Averages + Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Order (Today)</p>
                <p className="text-xl font-black text-white">${(todayAvg/100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Order (Week)</p>
                <p className="text-xl font-black text-white">${(weekAvg/100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Order (Month)</p>
                <p className="text-xl font-black text-white">${(monthAvg/100).toFixed(2)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cancelled</p>
                <p className="text-xl font-black text-red-400">{cancelledCount}</p>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">Top Items This Week</h2>
              {topItems.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No orders this week</p>
              ) : (
                <div className="space-y-2">
                  {topItems.map(([name, data], i) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs font-bold w-5">#{i+1}</span>
                        <span className="text-white text-sm font-semibold">{name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-xs">{data.count} sold</span>
                        <span className="text-[#D4AF37] text-sm font-bold">${(data.revenue/100).toFixed(2)}</span>
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