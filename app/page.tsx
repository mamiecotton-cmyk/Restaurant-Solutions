import Hero from '@/components/Hero'
import Menu from '@/components/Menu'
import Story from '@/components/Story'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Hero />
      <Menu />
      <Story />
      <Footer />
    </main>
  )
}
