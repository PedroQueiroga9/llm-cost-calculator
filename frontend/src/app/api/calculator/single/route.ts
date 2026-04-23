import { NextRequest, NextResponse } from 'next/server'
import { calculateSingle } from '@/lib/pricing-service'
import { verifyToken, getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { model_id, input_tokens, output_tokens, use_cache, use_batch, save, label } = body

  try {
    const result = calculateSingle(model_id, input_tokens, output_tokens, use_cache, use_batch)

    if (save) {
      const userId = await verifyToken(req.headers.get('authorization'))
      if (!userId) return NextResponse.json({ detail: 'Login necessário para salvar' }, { status: 401 })
      await getSupabaseAdmin()
        .from('calculation_history')
        .insert({ user_id: userId, type: 'single', label: label || 'Cálculo por requisição', params: body, result })
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ detail: (e as Error).message }, { status: 404 })
  }
}
