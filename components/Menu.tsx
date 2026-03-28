'use client'

import { useState, useEffect } from 'react'
import MenuCard from './MenuCard'

const menuItems = [
  {
    id: 'catfish',
    name: 'Crispy Catfish',
    priceRange: '$18 – $25',
    price: 2000,
    imageSrc: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80',
    imageAlt: 'Crispy fried catfish',
  },
  {
    id: 'wings',
    name: 'Soul Wings',
    priceRange: '$14 – $20',
    price: 1700,
    imageSrc: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    imageAlt: 'Soul food chicken wings',
  },
  {
    id: 'poboy',
    name: "Shrimp Po' Boy",
    priceRange: '$16 – $22',
    price: 1900,
    imageSrc: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
    imageAlt: "Shrimp po' boy sandwich",
  },
  {
    id: 'burger',
    name: 'Smash Burger',
    priceRange: '$14 – $18',
    price: 1600,
    imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    imageAlt: 'Smash burger',
  },
]

export default function Menu() {
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const soldOut = new Set<string>(
            data.filter((item: any) => !item.available).map((item: any) => item.id)
          )
          setUnavailable(soldOut)
        }
      })
      .catch(() => {})
  }, [])

  const handleItemOrder = async (item: typeof menuItems[0]) => {
    if (unavailable.has(item.id)) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: item.name, price: item.price, quantity: 1 }],
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <section id="menu" className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-bold mb-3">— Fan Favorites —</p>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            The Menu
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const soldOut = unavailable.has(item.id)
            return (
              <div key={item.id} className={`relative ${soldOut ? 'opacity-60' : ''}`}>
                {soldOut && (
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg">
                    SOLD OUT
                  </div>
                )}
                <MenuCard
                  name={item.name}
                  priceRange={item.priceRange}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  onOrder={() => !loading && !soldOut && handleItemOrder(item)}
                  soldOut={soldOut}
                />
              </div>
            )
          })}
        </div>

        {/* Full Order CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4 text-sm uppercase tracking-widest">Ready to order everything?</p>
          <button
            onClick={async () => {
              const availableItems = menuItems.filter((i) => !unavailable.has(i.id))
              if (availableItems.length === 0) return
              setLoading(true)
              try {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    items: availableItems.map(i => ({ name: i.name, price: i.price, quantity: 1 })),
                  }),
                })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              } catch (err) {
                console.error(err)
                setLoading(false)
              }
            }}
            disabled={loading}
            className="bg-[#D4AF37] text-black font-black text-base px-10 py-4 rounded-full uppercase tracking-wider hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-60 min-h-[56px]"
          >
            {loading ? 'Loading...' : '🛒 Order the Full Spread'}
          </button>
        </div>
      </div>
    </section>
  )
}