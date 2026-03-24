'use client'

import MenuCard from './MenuCard'
import { useCart } from '@/context/CartContext'

const menuItems = [
  {
    id: 'catfish',
    name: "Catfish Po'Boy",
    priceRange: '$16.50',
    price: 1650,
    imageSrc: '/Catfish_Dinner.png',
    imageAlt: 'Crispy fried catfish po boy',
    description: "Seasoned catfish on a toasted hoagie with hush puppies & tangy sauce",
  },
  {
    id: 'wings',
    name: 'Garlic Butter Wings',
    priceRange: '$17.00',
    price: 1700,
    imageSrc: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    imageAlt: 'Garlic butter wings',
    description: "Juicy wings tossed in Wally's rich garlic butter sauce",
  },
  {
    id: 'chicken',
    name: 'Fried Chicken Dinner',
    priceRange: '$20.00',
    price: 2000,
    imageSrc: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&q=80',
    imageAlt: 'Fried chicken dinner with sides',
    description: "Crispy fried chicken served with 2 classic sides",
  },
  {
    id: 'turkey',
    name: 'Turkey Bowl',
    priceRange: '$15.00',
    price: 1500,
    imageSrc: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    imageAlt: 'Turkey bowl',
    description: "Smoked turkey over rice with greens and house sauce",
  },
  {
    id: 'jambalaya',
    name: 'Jambalaya',
    priceRange: '$13.00',
    price: 1300,
    imageSrc: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
    imageAlt: 'Jambalaya',
    description: "Pacific Northwest spin on a Southern classic",
  },
  {
    id: 'mac',
    name: 'Mac & Cheese',
    priceRange: '$6.00',
    price: 600,
    imageSrc: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
    imageAlt: 'Baked mac and cheese',
    description: "Baked to perfection with a golden top — a fan favorite side",
  },
  {
    id: 'cobbler',
    name: 'Peach Cobbler Cheesecake',
    priceRange: '$12.50',
    price: 1250,
    imageSrc: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    imageAlt: 'Peach cobbler cheesecake',
    description: "Peach cobbler meets creamy cheesecake — pure soul",
  },
  {
    id: 'koolaid',
    name: 'Mango Kool-Aid',
    priceRange: '$3.00',
    price: 300,
    imageSrc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
    imageAlt: 'Mango Kool-Aid drink',
    description: "House-made mango Kool-Aid — the perfect pairing",
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
              style={{ backgroundColor: '#00D4D4', color: '#050810', boxShadow: '0 0 25px rgba(0,212,212,0.6)' }}
            >
              🛒 View Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}