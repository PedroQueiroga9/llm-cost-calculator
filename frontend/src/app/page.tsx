import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/layout/Hero'
import { Calculator } from '@/components/calculator/Calculator'

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-brand-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-brand-950/30 blur-[100px]" />
      </div>

      <Navbar />
      <Hero />
      <Calculator />

      <footer className="border-t border-white/[0.04] py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 font-body">
            Preços atualizados em abril 2026 · Fontes: documentações oficiais dos provedores
          </p>
          <p className="text-xs text-slate-700 font-body">
            Câmbio estimado: USD 1 = BRL 5,70
          </p>
        </div>
      </footer>
    </main>
  )
}
