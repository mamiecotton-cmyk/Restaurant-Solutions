'use client'

import { useState } from 'react'
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

  const handleItemOrder = async (item: typeof menuItems[0]) => {
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
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              name={item.name}
              priceRange={item.priceRange}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
              onOrder={() => !loading && handleItemOrder(item)}
            />
          ))}
        </div>

        {/* Full Order CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4 text-sm uppercase tracking-widest">Ready to order everything?</p>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    items: menuItems.map(i => ({ name: i.name, price: i.price, quantity: 1 })),
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
