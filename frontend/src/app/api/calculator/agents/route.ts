import { NextRequest, NextResponse } from 'next/server'
import { calculateAgentSystem } from '@/lib/pricing-service'
import { verifyToken, getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { agents, save, label } = body

  try {
    const result = calculateAgentSystem(agents)

    if (save) {
      const userId = await verifyToken(req.headers.get('authorization'))
      if (!userId) return NextResponse.json({ detail: 'Login necessário para salvar' }, { status: 401 })
      await getSupabaseAdmin()
        .from('calculation_history')
        .insert({ user_id: userId, type: 'agents', label: label || 'Sistema de agentes', params: body, result })
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ detail: (e as Error).message }, { status: 404 })
  }
}
