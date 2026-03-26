'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

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
  preparing: { label: '🍳 PREP', color: 'text-orange-300', bg: 'bg-orange-900/40', border: 'border-orange-500/50' },
  ready: { label: '✅ READY', color: 'text-green-300', bg: 'bg-green-900/40', border: 'border-green-500/50' },
  completed: { label: '📦 DONE', color: 'text-gray-400', bg: 'bg-gray-800/40', border: 'border-gray-600/50' },
  cancelled: { label: '❌ CANCEL', color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
}

const NEXT_STATUSES: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const beepTimes = [0, 0.2, 0.4]
    beepTimes.forEach((startTime) => {
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start(audioCtx.currentTime + startTime)
      oscillator.stop(audioCtx.currentTime + startTime + 0.12)
    })
  } catch (e) {
    console.warn('Could not play notification sound:', e)
  }
}

function printOrderReceipt(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="text-align:left;padding:4px 0;">${item.quantity}x ${item.name}</td>
          <td style="text-align:right;padding:4px 0;">$${(item.amount / 100).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt</title>
      <style>
        @page { margin: 0; size: 80mm auto; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; width: 80mm; padding: 8mm 4mm; font-size: 12px; color: #000; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
        .header p { font-size: 10px; }
        .order-info { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .order-info p { margin-bottom: 2px; }
        .label { font-weight: bold; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        .items-table { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .total-row td { font-weight: bold; font-size: 16px; padding-top: 8px; border-top: 2px dashed #000; }
        .footer { text-align: center; margin-top: 12px; font-size: 10px; }
        .order-number { font-size: 14px; font-weight: bold; text-align: center; padding: 6px 0; border: 2px solid #000; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WALLY'S NW SOUL</h1>
        <p>Northwest Soul. Real Flavor.</p>
      </div>
      <div class="order-number">ORDER #${order.id.slice(0, 8).toUpperCase()}</div>
      <div class="order-info">
        <p><span class="label">Date:</span> ${new Date(order.created_at).toLocaleString()}</p>
        ${order.customer_name ? `<p><span class="label">Customer:</span> ${order.customer_name}</p>` : ''}
        ${order.customer_email ? `<p><span class="label">Email:</span> ${order.customer_email}</p>` : ''}
      </div>
      <div class="items-table">
        <table><tbody>${itemsHtml}</tbody></table>
      </div>
      <table><tbody>
        <tr class="total-row">
          <td style="text-align:left;">TOTAL</td>
          <td style="text-align:right;">$${(order.amount_total / 100).toFixed(2)}</td>
        </tr>
      </tbody></table>
      <div class="footer">
        <p>Thank you for your order!</p>
        <p>Follow us @wallys_nw_soul</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=320,height=600')
  if (printWindow) {
    printWindow.document.write(receiptHtml)
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
  if (diff < 1) return 'just now'
  return `${diff}m ago`
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('active')
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
              newIncoming.forEach((order: Order) => printOrderReceipt(order))
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
    if (filter === 'active') return ['new', 'preparing', 'ready'].includes(o.status)
    if (filter === 'all') return true
    return o.status === filter
  })

  const newCount = orders.filter((o) => o.status === 'new').length
  const prepCount = orders.filter((o) => o.status === 'preparing').length
  const readyCount = orders.filter((o) => o.status === 'ready').length

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
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-[#D4AF37] uppercase tracking-wide">
              Orders
            </h1>
            {/* Live counters */}
            <div className="flex gap-2">
              {newCount > 0 && (
                <span className="bg-yellow-600 text-black text-xs font-black px-2 py-1 rounded-full">
                  {newCount} NEW
                </span>
              )}
              {prepCount > 0 && (
                <span className="bg-orange-600 text-white text-xs font-black px-2 py-1 rounded-full">
                  {prepCount} PREP
                </span>
              )}
              {readyCount > 0 && (
                <span className="bg-green-600 text-white text-xs font-black px-2 py-1 rounded-full">
                  {readyCount} READY
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg border transition-colors ${
                autoPrint
                  ? 'bg-green-900/40 border-green-500/50 text-green-300'
                  : 'bg-[#1a1a1a] border-white/10 text-gray-500'
              }`}
            >
              🖨️ {autoPrint ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchOrders() }}
              className="text-xs bg-[#1a1a1a] border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg hover:border-[#D4AF37]/50 transition-colors"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {['active', 'new', 'preparing', 'ready', 'completed', 'cancelled', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-[#D4AF37]/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No orders found</p>
            <p className="text-gray-600 text-sm mt-1">Orders appear here when customers check out</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status]
              const nextStatuses = NEXT_STATUSES[order.status]
              const isUrgent = order.status === 'new' && isOlderThanMinutes(order.created_at, 2)

              return (
                <div
                  key={order.id}
                  className={`border rounded-xl p-3 flex flex-col justify-between ${config.bg} ${config.border} ${
                    isUrgent ? 'flash-urgent border-red-500 border-2' : ''
                  }`}
                >
                  {/* Top: Status + Time */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-black text-[11px] uppercase ${isUrgent ? 'text-red-400' : config.color}`}>
                        {isUrgent ? '🚨 URGENT' : config.label}
                      </span>
                      <span className={`text-[10px] font-mono ${isUrgent ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                        {timeAgo(order.created_at, now)}
                      </span>
                    </div>

                    {/* Order number */}
                    <p className="text-[#D4AF37] font-black text-xs mb-1">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </p>

                    {/* Customer */}
                    {order.customer_name && (
                      <p className="text-white font-semibold text-xs truncate mb-2">
                        {order.customer_name}
                      </p>
                    )}

                    {/* Items */}
                    <div className="space-y-0.5 mb-2">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-gray-300 text-[11px] leading-tight truncate">
                          {item.quantity}× {item.name}
                        </p>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-white/10 pt-1.5 mb-2">
                      <p className="text-[#D4AF37] font-black text-sm">
                        ${(order.amount_total / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Actions */}
                  <div className="flex flex-col gap-1.5">
                    {/* Reprint button */}
                    <button
                      onClick={() => printOrderReceipt(order)}
                      className="w-full text-[10px] font-bold uppercase px-2 py-1.5 rounded-lg bg-green-900/50 text-green-300 hover:bg-green-800/60 transition-colors"
                    >
                      🖨️ Print
                    </button>

                    {/* Status buttons */}
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={`w-full text-[10px] font-bold uppercase px-2 py-1.5 rounded-lg transition-colors ${
                          s === 'cancelled'
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-800/60'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30'
                        }`}
                      >
                        → {STATUS_CONFIG[s].label}
                      </button>
                    ))}
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