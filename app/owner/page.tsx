'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

interface MenuItem {
  id: string
  name: string
  price: number
  price_range: string
  description: string
  image_url: string
  available: boolean
  sort_order: number
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

function calcAvgOrderTime(orders: Order[], resetAfter: string | null): string {
  const cutoff = resetAfter ? new Date(resetAfter).getTime() : 0
  const eligible = orders.filter(
    (o) => (o.status === 'ready' || o.status === 'completed') && o.created_at && o.updated_at && new Date(o.created_at).getTime() >= cutoff
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resetAfter, setResetAfter] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price_range: '', price: 0, description: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch (err) { console.error('Failed to fetch orders:', err) }
    finally { setLoading(false) }
  }, [])

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      if (Array.isArray(data)) setMenuItems(data)
    } catch (err) { console.error('Failed to fetch menu:', err) }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.value) setResetAfter(data.value)
    } catch (err) { console.error('Failed to fetch settings:', err) }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchMenu()
    fetchSettings()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders, fetchMenu, fetchSettings])

  const resetAvgTime = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/settings', { method: 'POST' })
      const data = await res.json()
      if (data.value) setResetAfter(data.value)
    } catch (err) { console.error('Failed to reset:', err) }
    finally { setResetting(false) }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, available: !item.available }),
      })
      if (res.ok) setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, available: !m.available } : m)))
    } catch (err) { console.error('Failed to toggle:', err) }
  }

  const saveItem = async (item: MenuItem) => {
    setSaving(true)
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          price: item.price,
          price_range: item.price_range,
          description: item.description,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMenuItems((prev) => prev.map((m) => (m.id === item.id ? updated : m)))
        setEditingItem(null)
      }
    } catch (err) { console.error('Failed to save:', err) }
    finally { setSaving(false) }
  }

  const addItem = async () => {
    if (!newItem.name) return
    setSaving(true)
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        const created = await res.json()
        setMenuItems((prev) => [...prev, created])
        setNewItem({ name: '', price_range: '', price: 0, description: '' })
        setShowAddForm(false)
      }
    } catch (err) { console.error('Failed to add:', err) }
    finally { setSaving(false) }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' })
      if (res.ok) setMenuItems((prev) => prev.filter((m) => m.id !== id))
    } catch (err) { console.error('Failed to delete:', err) }
    finally { setDeletingId(null) }
  }

  const uploadImage = async (itemId: string, file: File) => {
    setUploadingId(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('itemId', itemId)
      const res = await fetch('/api/menu/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setMenuItems((prev) => prev.map((m) => (m.id === itemId ? { ...m, image_url: url } : m)))
        if (editingItem?.id === itemId) setEditingItem({ ...editingItem, image_url: url })
      }
    } catch (err) { console.error('Failed to upload:', err) }
    finally { setUploadingId(null) }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (res.ok) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus as Order['status'] } : o)))
    } catch (err) { console.error('Failed to update order:', err) }
  }

  const nonCancelled = orders.filter((o) => o.status !== 'cancelled')
  const todayRevenue = nonCancelled.filter((o) => isToday(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const weekRevenue = nonCancelled.filter((o) => isThisWeek(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const monthRevenue = nonCancelled.filter((o) => isThisMonth(o.created_at)).reduce((sum, o) => sum + o.amount_total, 0)
  const todayOrders = nonCancelled.filter((o) => isToday(o.created_at)).length
  const avgTime = calcAvgOrderTime(orders, resetAfter)
  const unavailableCount = menuItems.filter((m) => !m.available).length

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
      {/* Hidden file input for image uploads */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          const itemId = fileInputRef.current?.dataset.itemId
          if (file && itemId) uploadImage(itemId, file)
          e.target.value = ''
        }}
      />

      <div className="max-w-[1400px] mx-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide mb-1">📊 Owner Dashboard</h1>
            <button onClick={() => { setLoading(true); fetchOrders(); fetchMenu() }}
              className="text-[10px] bg-[#1a1a1a] border border-white/10 text-gray-300 px-3 py-1 rounded-full">↻ Refresh</button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
            <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl px-5 py-3 text-center min-w-[140px]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Avg Order Time</p>
              <p className="text-3xl font-black text-purple-400">{avgTime}</p>
              <button onClick={resetAvgTime} disabled={resetting}
                className="mt-2 text-[9px] font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-3 py-1 hover:bg-purple-800/50 transition-colors disabled:opacity-50">
                {resetting ? 'Resetting...' : '↻ Reset Timer'}
              </button>
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

        {/* Menu Management */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-white uppercase tracking-wide">Menu Management</h2>
              {unavailableCount > 0 && (
                <span className="bg-red-900/40 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full">{unavailableCount} SOLD OUT</span>
              )}
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-4 py-2 hover:bg-purple-800/50 transition-colors">
              {showAddForm ? '✕ Cancel' : '+ Add Item'}
            </button>
          </div>

          {/* Add New Item Form */}
          {showAddForm && (
            <div className="bg-[#111] border border-purple-500/20 rounded-lg p-4 mb-4">
              <p className="text-xs font-bold text-purple-300 uppercase mb-3">New Menu Item</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="Item name *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                <input type="text" placeholder="Price range (e.g. $14 – $20)" value={newItem.price_range} onChange={(e) => setNewItem({ ...newItem, price_range: e.target.value })}
                  className="text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                <input type="number" placeholder="Price in cents (e.g. 1700)" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                  className="text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>
              <button onClick={addItem} disabled={saving || !newItem.name}
                className="text-xs font-bold uppercase bg-purple-600 text-white rounded-lg px-6 py-2 hover:bg-purple-500 transition-colors disabled:opacity-50">
                {saving ? 'Adding...' : '+ Add to Menu'}
              </button>
            </div>
          )}

          {/* Menu Items Grid */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isEditing = editingItem?.id === item.id
              return (
                <div key={item.id} className={`border rounded-lg p-3 transition-all ${item.available ? 'border-white/5' : 'border-red-500/20 bg-red-900/10'}`}>
                  {isEditing ? (
                    /* Edit Mode */
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">Name</label>
                          <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">Price Range</label>
                          <input type="text" value={editingItem.price_range} onChange={(e) => setEditingItem({ ...editingItem, price_range: e.target.value })}
                            className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">Price (cents)</label>
                          <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                            className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">Description</label>
                          <input type="text" value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Image preview + upload */}
                        {editingItem.image_url && (
                          <img src={editingItem.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <button onClick={() => { if (fileInputRef.current) { fileInputRef.current.dataset.itemId = item.id; fileInputRef.current.click() } }}
                          disabled={uploadingId === item.id}
                          className="text-[10px] font-bold uppercase bg-[#0a0a0a] text-gray-300 border border-white/10 rounded-lg px-3 py-2 hover:border-purple-500/40 transition-colors disabled:opacity-50">
                          {uploadingId === item.id ? 'Uploading...' : '📷 Upload Image'}
                        </button>
                        <div className="flex-1" />
                        <button onClick={() => saveItem(editingItem)} disabled={saving}
                          className="text-[10px] font-bold uppercase bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-500 transition-colors disabled:opacity-50">
                          {saving ? 'Saving...' : '✓ Save'}
                        </button>
                        <button onClick={() => setEditingItem(null)}
                          className="text-[10px] font-bold uppercase bg-[#0a0a0a] text-gray-400 border border-white/10 rounded-lg px-4 py-2 hover:text-white transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</p>
                          <span className="text-[10px] text-[#D4AF37]">{item.price_range}</span>
                          {item.description && <span className="text-[10px] text-gray-600 truncate">— {item.description}</span>}
                        </div>
                        <p className="text-[9px] text-gray-600 font-mono">ID: {item.id} · ${(item.price / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setEditingItem({ ...item })}
                          className="text-[10px] font-bold uppercase text-gray-400 hover:text-purple-300 transition-colors px-2 py-1">
                          ✏️ Edit
                        </button>
                        <button onClick={() => toggleAvailability(item)}
                          className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer ${item.available ? 'bg-green-500 justify-end' : 'bg-red-500/40 justify-start'}`}>
                          <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                        </button>
                        <button onClick={() => deleteItem(item.id)} disabled={deletingId === item.id}
                          className="text-[10px] font-bold text-red-400/40 hover:text-red-400 transition-colors px-1 disabled:opacity-50">
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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