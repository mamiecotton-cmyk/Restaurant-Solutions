'use client'

import { useEffect, useState, useCallback, useRef, DragEvent } from 'react'
import Link from 'next/link'

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

function ImageDropZone({ imageUrl, onFile, uploading, label }: {
  imageUrl?: string
  onFile: (file: File) => void
  uploading: boolean
  label?: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDragIn = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragging(true) }
  const handleDragOut = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragging(false) }
  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden ${
        dragging
          ? 'border-purple-400 bg-purple-900/20'
          : imageUrl
          ? 'border-white/10 hover:border-purple-500/40'
          : 'border-white/10 hover:border-purple-500/40 bg-[#0a0a0a]'
      }`}
      style={{ minHeight: '120px' }}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />

      {uploading ? (
        <div className="flex items-center justify-center h-full min-h-[120px]">
          <p className="text-purple-300 text-xs font-bold uppercase animate-pulse">Uploading...</p>
        </div>
      ) : imageUrl ? (
        <div className="relative">
          <img src={imageUrl} alt="" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-xs font-bold uppercase">Click or drop to replace</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 px-4">
          <span className="text-2xl mb-2">📷</span>
          <p className="text-gray-400 text-xs font-bold uppercase text-center">{label || 'Drop image here'}</p>
          <p className="text-gray-600 text-[10px] mt-1">or click to browse</p>
        </div>
      )}
    </div>
  )
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price_range: '', price: 0, description: '' })
  const [newItemImage, setNewItemImage] = useState<File | null>(null)
  const [newItemPreview, setNewItemPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      if (Array.isArray(data)) setMenuItems(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/menu', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, available: !item.available }) })
      if (res.ok) setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, available: !m.available } : m))
    } catch (err) { console.error(err) }
  }

  const saveItem = async (item: MenuItem) => {
    setSaving(true)
    try {
      const res = await fetch('/api/menu', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, name: item.name, price: item.price, price_range: item.price_range, description: item.description }) })
      if (res.ok) { const updated = await res.json(); setMenuItems(prev => prev.map(m => m.id === item.id ? updated : m)); setEditingItem(null) }
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const uploadImage = async (itemId: string, file: File) => {
    setUploadingId(itemId)
    try {
      const formData = new FormData(); formData.append('file', file); formData.append('itemId', itemId)
      const res = await fetch('/api/menu/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, image_url: url } : m))
        if (editingItem?.id === itemId) setEditingItem(prev => prev ? { ...prev, image_url: url } : null)
      }
    } catch (err) { console.error(err) }
    finally { setUploadingId(null) }
  }

  const addItem = async () => {
    if (!newItem.name) return
    setSaving(true)
    try {
      const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) })
      if (res.ok) {
        const created = await res.json()
        // If there's an image, upload it
        if (newItemImage) {
          const formData = new FormData(); formData.append('file', newItemImage); formData.append('itemId', created.id)
          const uploadRes = await fetch('/api/menu/upload', { method: 'POST', body: formData })
          if (uploadRes.ok) {
            const { url } = await uploadRes.json()
            created.image_url = url
          }
        }
        setMenuItems(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        setNewItem({ name: '', price_range: '', price: 0, description: '' })
        setNewItemImage(null)
        setNewItemPreview('')
        setShowAddForm(false)
      }
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleNewItemImage = (file: File) => {
    setNewItemImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setNewItemPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' })
      if (res.ok) setMenuItems(prev => prev.filter(m => m.id !== id))
    } catch (err) { console.error(err) }
    finally { setDeletingId(null) }
  }

  const unavailableCount = menuItems.filter(m => !m.available).length

  return (
    <main className="bg-[#0a0a0a] min-h-screen px-4 pt-2 pb-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/owner" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">← Dashboard</Link>
            </div>
            <h1 className="text-xl font-black text-purple-400 uppercase tracking-wide">🍽️ Menu Management</h1>
            <p className="text-[10px] text-gray-500 mt-1">{menuItems.length} items{unavailableCount > 0 ? ` · ${unavailableCount} sold out` : ''}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Link href="/kitchen" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">🔥 Kitchen</Link>
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-gray-600 hover:text-gray-400">📋 Front</Link>
              <Link href="/owner" className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white">📊 Owner</Link>
            </div>
            <button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) { setNewItemImage(null); setNewItemPreview('') } }}
              className="text-xs font-bold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-lg px-4 py-2 hover:bg-purple-800/50 transition-colors">
              {showAddForm ? '✕ Cancel' : '+ Add Item'}
            </button>
          </div>
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="bg-[#1a1a1a] border border-purple-500/20 rounded-xl p-5 mb-6">
            <p className="text-xs font-bold text-purple-300 uppercase mb-4">New Menu Item</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image drop zone */}
              <div>
                <ImageDropZone
                  imageUrl={newItemPreview}
                  onFile={handleNewItemImage}
                  uploading={false}
                  label="Drop item image here"
                />
                {newItemImage && (
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{newItemImage.name}</p>
                )}
              </div>
              {/* Form fields */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Name *</label>
                  <input type="text" placeholder="e.g. Crispy Catfish" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Price Range</label>
                  <input type="text" placeholder="e.g. $14 – $20" value={newItem.price_range} onChange={e => setNewItem({ ...newItem, price_range: e.target.value })}
                    className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Price (cents)</label>
                  <input type="number" placeholder="e.g. 1700" value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                    className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                  <input type="text" placeholder="Short description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={addItem} disabled={saving || !newItem.name}
                className="text-xs font-bold uppercase bg-purple-600 text-white rounded-lg px-8 py-2.5 hover:bg-purple-500 transition-colors disabled:opacity-50">
                {saving ? 'Adding...' : '+ Add to Menu'}
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading menu...</div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">No menu items. Click "+ Add Item" to get started.</p></div>
        ) : (
          <div className="space-y-3">
            {menuItems.map(item => {
              const isEditing = editingItem?.id === item.id
              return (
                <div key={item.id} className={`bg-[#1a1a1a] border rounded-xl p-4 transition-all ${item.available ? 'border-white/5' : 'border-red-500/20'}`}>
                  {isEditing ? (
                    /* Edit Mode */
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Image drop zone for editing */}
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Image</label>
                          <ImageDropZone
                            imageUrl={editingItem.image_url}
                            onFile={(file) => uploadImage(item.id, file)}
                            uploading={uploadingId === item.id}
                          />
                        </div>
                        {/* Form fields */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Name</label>
                            <input type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Price Range</label>
                            <input type="text" value={editingItem.price_range} onChange={e => setEditingItem({ ...editingItem, price_range: e.target.value })}
                              className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Price (cents)</label>
                            <input type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                              className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                            <input type="text" value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                              className="w-full text-sm bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingItem(null)}
                          className="text-xs font-bold uppercase bg-[#0a0a0a] text-gray-400 border border-white/10 rounded-lg px-5 py-2 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => saveItem(editingItem)} disabled={saving}
                          className="text-xs font-bold uppercase bg-green-600 text-white rounded-lg px-5 py-2 hover:bg-green-500 transition-colors disabled:opacity-50">{saving ? 'Saving...' : '✓ Save Changes'}</button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center gap-4">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-700 text-3xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-base font-bold ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</p>
                        <p className="text-sm text-[#D4AF37]">{item.price_range} <span className="text-gray-600 text-[10px]">(${(item.price / 100).toFixed(2)})</span></p>
                        {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                        {!item.available && <p className="text-[10px] text-red-400 font-bold uppercase mt-1">Sold Out</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => setEditingItem({ ...item })}
                          className="text-xs font-bold uppercase text-gray-400 hover:text-purple-300 transition-colors px-3 py-2 bg-[#0a0a0a] rounded-lg border border-white/5 hover:border-purple-500/30">✏️ Edit</button>
                        <button onClick={() => toggleAvailability(item)}
                          className={`w-12 h-7 rounded-full flex items-center transition-colors cursor-pointer ${item.available ? 'bg-green-500 justify-end' : 'bg-red-500/40 justify-start'}`}>
                          <div className="w-6 h-6 bg-white rounded-full shadow mx-0.5" />
                        </button>
                        <button onClick={() => deleteItem(item.id)} disabled={deletingId === item.id}
                          className="text-xs font-bold text-red-400/40 hover:text-red-400 transition-colors px-2 py-2 disabled:opacity-50">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}