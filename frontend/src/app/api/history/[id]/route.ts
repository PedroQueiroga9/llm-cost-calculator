import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getSupabaseAdmin } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await verifyToken(req.headers.get('authorization'))
  if (!userId) return NextResponse.json({ detail: 'Não autorizado' }, { status: 401 })

  const { data } = await getSupabaseAdmin()
    .from('calculation_history')
    .delete()
    .eq('id', Number(params.id))
    .eq('user_id', userId)
    .select()

  if (!data?.length) return NextResponse.json({ detail: 'Registro não encontrado' }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
