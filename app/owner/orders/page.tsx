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
const ORDERS_PER_PAGE = 10

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function isToday(d: string) { return new Date(d).toDateString() === new Date().toDateString() }
function isThisWeek(d: string) { return new Date(d) >= new Date(Date.now() - 7*24*60*60*1000) }
function isThisMonth(d: string) { const a = new Date(d), b = new Date(); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() }

function exportToCSV(orders: Order[]) {
  const headers = ['Order ID','Date','Customer','Email','Items','Total','Status']
  const rows = orders.map((o) => [o.id.slice(0,8).toUpperCase(), new Date(o.created_at).toLocaleString(), formatName(o.customer_name), o.customer_email||'', o.items.map(i=>`${i.quantity}x ${i.name}`).join('; '), `$${(o.amount_total/100).toFixed(2)}`, o.status])
  const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=`wallys-orders-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders(); const i = setInterval(fetchOrders, 15000); return () => clearInterval(i) }, [fetchOrders])

  const updateStatus = async (id: string, s: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:s}) })
      if (res.ok) setOrders(prev => prev.map(o => o.id===id ? {...o, status: s as Order['status']} : o))
    } catch (err) { console.error(err) }
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (dateFilter === 'today' && !isToday(o.created_at)) return false
    if (dateFilter === 'week' && !isThisWeek(o.created_at)) return false
    if (dateFilter === 'month' && !isThisMonth(o.created_at)) return false
    if (search) { const q = search.toLowerCase(); return o.customer_name?.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q)) }
    return true
  })

  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE)
  const paginated = filtered.slice((page-1)*ORDERS_PER_PAGE, page*ORDERS_PER_PAGE)

  useEffect(() => { setPage(1) }, [search, statusFilter, dateFilter])

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/owner" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">← Dashboard</Link>
            </div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide">📦 Order Management</h1>
            <p className="text-[10px] text-gray-500 mt-1">{filtered.length} orders · Page {page} of {totalPages || 1}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input type="text" placeholder="Search name, order ID, item..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] text-sm bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
            <option value="all">ALL TIME</option><option value="today">TODAY</option><option value="week">THIS WEEK</option><option value="month">THIS MONTH</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
            <option value="all">ALL STATUS</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <button onClick={() => exportToCSV(filtered)} className="text-xs font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-4 py-2 hover:bg-purple-800/50 transition-colors">📥 Export CSV</button>
          <button onClick={() => { setLoading(true); fetchOrders() }} className="text-xs bg-[#1a1a1a] border border-white/10 text-gray-300 px-3 py-2 rounded-lg">↻</button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">No orders found</p></div>
        ) : (
          <>
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
                  {paginated.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2"><span className="text-[#D4AF37] font-mono text-xs font-bold">#{order.id.slice(0,6).toUpperCase()}</span></td>
                      <td className="py-3 px-2"><span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</span><br/><span className="text-gray-600 text-[10px]">{new Date(order.created_at).toLocaleTimeString()}</span></td>
                      <td className="py-3 px-2"><span className="text-white text-xs font-semibold">{formatName(order.customer_name)||'—'}</span>{order.customer_email && <><br/><span className="text-gray-600 text-[10px]">{order.customer_email}</span></>}</td>
                      <td className="py-3 px-2">{order.items.map((item,i) => <span key={i} className="text-gray-300 text-xs block leading-tight">{item.quantity}× {item.name}</span>)}</td>
                      <td className="py-3 px-2 text-right"><span className="text-[#D4AF37] font-black text-sm">${(order.amount_total/100).toFixed(2)}</span></td>
                      <td className="py-3 px-2 text-center">
                        <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1.5 border cursor-pointer transition-colors ${
                            order.status==='new'?'bg-yellow-900/40 text-yellow-300 border-yellow-500/30':
                            order.status==='preparing'?'bg-orange-900/40 text-orange-300 border-orange-500/30':
                            order.status==='ready'?'bg-green-900/40 text-green-300 border-green-500/30':
                            order.status==='completed'?'bg-gray-800/40 text-gray-400 border-gray-600/30':
                            'bg-red-900/40 text-red-400 border-red-500/30'}`}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed">← Previous</button>
                <div className="flex gap-1">
                  {Array.from({length:Math.min(totalPages,7)},(_,i) => {
                    let pn: number; if(totalPages<=7) pn=i+1; else if(page<=4) pn=i+1; else if(page>=totalPages-3) pn=totalPages-6+i; else pn=page-3+i
                    return <button key={pn} onClick={()=>setPage(pn)} className={`text-xs font-bold w-8 h-8 rounded-lg transition-colors ${page===pn?'bg-purple-600 text-white':'bg-[#1a1a1a] text-gray-500 hover:text-white'}`}>{pn}</button>
                  })}
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}