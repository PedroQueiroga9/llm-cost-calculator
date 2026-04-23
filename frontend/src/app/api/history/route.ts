import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const userId = await verifyToken(req.headers.get('authorization'))
  if (!userId) return NextResponse.json({ detail: 'Não autorizado' }, { status: 401 })

  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50)
  const { data } = await getSupabaseAdmin()
    .from('calculation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return NextResponse.json(data ?? [])
}

export async function DELETE(req: NextRequest) {
  const userId = await verifyToken(req.headers.get('authorization'))
  if (!userId) return NextResponse.json({ detail: 'Não autorizado' }, { status: 401 })

  await getSupabaseAdmin().from('calculation_history').delete().eq('user_id', userId)
  return NextResponse.json({ cleared: true })
}
