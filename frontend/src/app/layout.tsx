import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'LLM Cost Calculator | Calcule e compare custos de IA',
  description: 'Calcule, compare e otimize custos de APIs de LLMs. Anthropic, OpenAI, Google, Groq, DeepSeek e mais.',
  keywords: ['LLM', 'custo', 'AI', 'calculadora', 'Claude', 'GPT', 'Gemini', 'tokens'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
