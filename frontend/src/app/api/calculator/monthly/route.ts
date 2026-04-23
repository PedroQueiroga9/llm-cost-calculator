import { NextRequest, NextResponse } from 'next/server'
import { calculateMonthly } from '@/lib/pricing-service'
import { verifyToken, getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { model_id, requests_per_day, input_tokens_per_req, output_tokens_per_req, use_cache, use_batch, save, label } = body

  try {
    const result = calculateMonthly(model_id, requests_per_day, input_tokens_per_req, output_tokens_per_req, use_cache, use_batch)

    if (save) {
      const userId = await verifyToken(req.headers.get('authorization'))
      if (!userId) return NextResponse.json({ detail: 'Login necessário para salvar' }, { status: 401 })
      await getSupabaseAdmin()
        .from('calculation_history')
        .insert({ user_id: userId, type: 'monthly', label: label || 'Estimativa mensal', params: body, result })
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ detail: (e as Error).message }, { status: 404 })
  }
}
