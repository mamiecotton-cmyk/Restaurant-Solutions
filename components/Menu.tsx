'use client'

import MenuCard from './MenuCard'
import { useCart } from '@/context/CartContext'

const menuItems = [
  {
    id: 'catfish',
    name: 'Crispy Catfish',
    priceRange: '$18 – $25',
    price: 2000,
    imageSrc: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80',
    imageAlt: 'Crispy fried catfish',
    description: "Southern-style fried catfish, seasoned to perfection",
  },
  {
    id: 'wings',
    name: 'Soul Wings',
    priceRange: '$14 – $20',
    price: 1700,
    imageSrc: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    imageAlt: 'Soul food chicken wings',
    description: "Fall-off-the-bone wings with Wally's signature sauce",
  },
  {
    id: 'poboy',
    name: "Shrimp Po' Boy",
    priceRange: '$16 – $22',
    price: 1900,
    imageSrc: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
    imageAlt: "Shrimp po' boy sandwich",
    description: "Crispy shrimp on a toasted hoagie with remoulade",
  },
  {
    id: 'burger',
    name: 'Smash Burger',
    priceRange: '$14 – $18',
    price: 1600,
    imageSrc: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    imageAlt: 'Smash burger',
    description: "Double smash patty with special sauce and pickles",
  },
]

export default function Menu() {
  const { setIsOpen, itemCount } = useCart()

  return (
    <section id="menu" className="py-24 px-4" style={{ background: '#070B14' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.4em] mb-3"
            style={{ color: '#00D4D4', textShadow: '0 0 8px rgba(0,212,212,0.6)' }}>
            — Fan Favorites —
          </p>
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white"
            style={{ fontFamily: 'Georgia, serif' }}>
            The Menu
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #00D4D4)' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.8)' }} />
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #00D4D4)' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <MenuCard key={item.id} {...item} />
          ))}
        </div>

        {itemCount > 0 && (
          <div className="text-center mt-14">
            <button
              onClick={() => setIsOpen(true)}
              className="font-black text-base px-10 py-4 rounded-full uppercase tracking-wider transition-all duration-200 min-h-[56px]"
              style={{
                backgroundColor: '#00D4D4',
                color: '#050810',
                boxShadow: '0 0 25px rgba(0,212,212,0.6)'
              }}
            >
              🛒 View Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}