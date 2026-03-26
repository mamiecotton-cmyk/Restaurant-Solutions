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
        @page {
          margin: 0;
          size: 80mm auto;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          padding: 8mm 4mm;
          font-size: 12px;
          color: #000;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .header p {
          font-size: 10px;
        }
        .order-info {
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .order-info p {
          margin-bottom: 2px;
        }
        .label {
          font-weight: bold;
          font-size: 11px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table {
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .total-row td {
          font-weight: bold;
          font-size: 16px;
          padding-top: 8px;
          border-top: 2px dashed #000;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 10px;
        }
        .order-number {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          padding: 6px 0;
          border: 2px solid #000;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WALLY'S NW SOUL</h1>
        <p>Northwest Soul. Real Flavor.</p>
      </div>

      <div class="order-number">
        ORDER #${order.id.slice(0, 8).toUpperCase()}
      </div>

      <div class="order-info">
        <p><span class="label">Date:</span> ${new Date(order.created_at).toLocaleString()}</p>
        ${order.customer_name ? `<p><span class="label">Customer:</span> ${order.customer_name}</p>` : ''}
        ${order.customer_email ? `<p><span class="label">Email:</span> ${order.customer_email}</p>` : ''}
      </div>

      <div class="items-table">
        <table>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <table>
        <tbody>
          <tr class="total-row">
            <td style="text-align:left;">TOTAL</td>
            <td style="text-align:right;">$${(order.amount_total / 100).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

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
  const created = new Date(dateStr).getTime()
  const now = Date.now()
  return now - created > minutes * 60 * 1000
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
              newIncoming.forEach((order: Order) => {
                printOrderReceipt(order)
              })
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

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 py-8">
      <style jsx global>{`
        @keyframes urgentFlash {
          0%, 100% { border-color: rgba(239, 68, 68, 0.7); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 20px 4px rgba(239, 68, 68, 0.4); }
        }
        .flash-urgent {
          animation: urgentFlash 1s ease-in-out infinite;
        }
      `}</style>

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-colors ${
                autoPrint
                  ? 'bg-green-900/40 border-green-500/50 text-green-300'
                  : 'bg-[#1a1a1a] border-white/10 text-gray-500'
              }`}
            >
              🖨️ Auto-Print {autoPrint ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchOrders() }}
              className="text-sm bg-[#1a1a1a] border border-white/10 text-gray-300 px-4 py-2 rounded-lg hover:border-[#D4AF37]/50 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
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
              const isUrgent = order.status === 'new' && isOlderThanMinutes(order.created_at, 2)

              return (
                <div
                  key={order.id}
                  className={`border rounded-2xl p-5 transition-all ${config.bg} ${isUrgent ? 'flash-urgent border-2' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`font-bold text-sm ${isUrgent ? 'text-red-400' : config.color}`}>
                          {isUrgent ? '🚨 URGENT — New' : config.label}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                        {isUrgent && (
                          <span className="text-red-400 text-xs font-bold">
                            {Math.floor((now - new Date(order.created_at).getTime()) / 60000)}m waiting
                          </span>
                        )}
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
                    <div className="flex sm:flex-col gap-2 items-start sm:items-end justify-end">
                      <button
                        onClick={() => printOrderReceipt(order)}
                        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-green-900/50 text-green-300 hover:bg-green-800/60 transition-colors"
                      >
                        🖨️ Print
                      </button>
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