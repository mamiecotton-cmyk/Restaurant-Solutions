'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import ViewSwitcher from '@/components/ViewSwitcher'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: '🔔 NEW', color: 'text-yellow-300', bg: 'bg-yellow-900/40', border: 'border-yellow-500/50' },
  preparing: { label: '🍳 COOKING', color: 'text-orange-300', bg: 'bg-orange-900/40', border: 'border-orange-500/50' },
  ready: { label: '✅ READY', color: 'text-green-300', bg: 'bg-green-900/40', border: 'border-green-500/50' },
  completed: { label: '📦 DONE', color: 'text-gray-400', bg: 'bg-gray-800/40', border: 'border-gray-600/50' },
  cancelled: { label: '❌ CANCEL', color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
}

const FORWARD_STATUS: Record<string, { next: string; label: string }> = {
  new: { next: 'preparing', label: '🍳 START COOKING' },
  preparing: { next: 'ready', label: '✅ READY FOR PICKUP' },
}

const ALL_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled']

const VIEW_OPTIONS = [
  { value: 'active', label: 'Active (New + Cooking)' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All Orders' },
]

function formatName(fullName: string | null): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const beepTimes = [0, 0.2, 0.4]
    beepTimes.forEach((startTime) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.value = 0.3
      osc.start(audioCtx.currentTime + startTime)
      osc.stop(audioCtx.currentTime + startTime + 0.12)
    })
  } catch (e) {
    console.warn('Could not play notification sound:', e)
  }
}

function printOrderTicket(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="text-align:left;padding:4px 0;font-size:16px;font-weight:bold;">${item.quantity}x ${item.name}</td></tr>`
    )
    .join('')

  const ticketHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kitchen Ticket</title>
      <style>
        @page { margin: 0; size: 80mm auto; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; width: 80mm; padding: 8mm 4mm; font-size: 12px; color: #000; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .header h1 { font-size: 16px; font-weight: bold; }
        .order-number { font-size: 18px; font-weight: bold; text-align: center; padding: 6px 0; border: 3px solid #000; margin-bottom: 8px; }
        .customer { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #000; }
        table { width: 100%; border-collapse: collapse; }
        .footer { text-align: center; margin-top: 12px; font-size: 10px; border-top: 2px dashed #000; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>KITCHEN TICKET</h1></div>
      <div class="order-number">ORDER #${order.id.slice(0, 8).toUpperCase()}</div>
      ${order.customer_name ? `<div class="customer">${formatName(order.customer_name)}</div>` : ''}
      <table><tbody>${itemsHtml}</tbody></table>
      <div class="footer"><p>${new Date(order.created_at).toLocaleString()}</p></div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=320,height=600')
  if (printWindow) {
    printWindow.document.write(ticketHtml)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      setTimeout(() => printWindow.close(), 2000)
    }, 500)
  }
}

function isOlderThanMinutes(dateStr: string, minutes: number): boolean {
  return Date.now() - new Date(dateStr).getTime() > minutes * 60 * 1000
}

function timeAgo(dateStr: string, now: number): string {
  const diff = Math.floor((now - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return 'now'
  return `${diff}m`
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<string>('active')
  const [now, setNow] = useState(Date.now())
  const [autoPrint, setAutoPrint] = useState(true)
  const knownOrderIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(timer)
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) {
        if (!isFirstLoad.current) {
          const newIncoming = data.filter(
            (o: Order) => o.status === 'new' && !knownOrderIds.current.has(o.id)
          )
          if (newIncoming.length > 0) {
            playNotificationSound()
            if (autoPrint) {
              newIncoming.forEach((order: Order) => printOrderTicket(order))
            }
          }
        }
        data.forEach((o: Order) => knownOrderIds.current.add(o.id))
        isFirstLoad.current = false
        setOrders(data)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [autoPrint])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
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
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus as Order['status'] } : o))
        )
      }
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (view === 'active') return ['new', 'preparing'].includes(o.status)
    if (view === 'all') return true
    return o.status === view
  })

  const newCount = orders.filter((o) => o.status === 'new').length
  const cookingCount = orders.filter((o) => o.status === 'preparing').length

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-3 py-4">
      <style jsx global>{`
        @keyframes urgentFlash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 16px 4px rgba(239, 68, 68, 0.5); }
        }
        .flash-urgent { animation: urgentFlash 1s ease-in-out infinite; }
      `}</style>

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-orange-400 uppercase tracking-wide">🔥 Kitchen</h1>
            <div className="flex gap-2">
              {newCount > 0 && (
                <span className="bg-yellow-600 text-black text-xs font-black px-2 py-1 rounded-full">{newCount} NEW</span>
              )}
              {cookingCount > 0 && (
                <span className="bg-orange-600 text-white text-xs font-black px-2 py-1 rounded-full">{cookingCount} COOKING</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ViewSwitcher />
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="text-xs font-bold uppercase bg-[#1a1a1a] text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:border-orange-500/40 transition-colors cursor-pointer"
            >
              {VIEW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg border transition-colors ${
                autoPrint ? 'bg-green-900/40 border-green-500/50 text-green-300' : 'bg-[#1a1a1a] border-white/10 text-gray-500'
              }`}
            >
              🖨️ {autoPrint ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchOrders() }}
              className="text-xs bg-[#1a1a1a] border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg hover:border-orange-500/50 transition-colors"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No orders</p>
            <p className="text-gray-600 text-sm mt-1">Waiting for orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status]
              const forward = FORWARD_STATUS[order.status]
              const isUrgent = order.status === 'new' && isOlderThanMinutes(order.created_at, 2)

              return (
                <div
                  key={order.id}
                  className={`border rounded-xl p-3 flex flex-col justify-between ${config.bg} ${config.border} ${
                    isUrgent ? 'flash-urgent border-red-500 border-2' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black text-[11px] uppercase ${isUrgent ? 'text-red-400' : config.color}`}>
                        {isUrgent ? '🚨 URGENT' : config.label}
                      </span>
                      <span className={`text-[10px] font-mono ${isUrgent ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                        {timeAgo(order.created_at, now)}
                      </span>
                    </div>

                    {order.customer_name && (
                      <p className="text-gray-400 text-xs font-semibold mb-2 truncate">
                        {formatName(order.customer_name)}
                      </p>
                    )}

                    <div className="space-y-1.5 mb-2">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-white font-black text-xl leading-tight">
                          {item.quantity}× {item.name}
                        </p>
                      ))}
                    </div>

                    <p className="text-gray-600 text-[9px] font-mono mb-3">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {forward && (
                      <button
                        onClick={() => updateStatus(order.id, forward.next)}
                        className="w-full text-sm font-black uppercase px-2 py-3 rounded-lg bg-orange-500 text-black hover:bg-orange-400 active:scale-95 transition-all"
                      >
                        {forward.label}
                      </button>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => printOrderTicket(order)}
                        className="flex-1 text-[10px] font-bold uppercase px-2 py-2 rounded-lg bg-green-900/50 text-green-300 hover:bg-green-800/60 active:scale-95 transition-all"
                      >
                        🖨️ Print
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="text-[10px] font-bold uppercase px-3 py-2 rounded-lg bg-red-900/30 text-red-400/60 hover:bg-red-900/50 hover:text-red-300 active:scale-95 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="w-full text-[10px] font-bold uppercase bg-[#111] text-gray-500 border border-white/5 rounded-lg px-2 py-1.5 hover:border-orange-500/30 transition-colors cursor-pointer appearance-none text-center"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s === order.status ? `● ${s.toUpperCase()}` : s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}