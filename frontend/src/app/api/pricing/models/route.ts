import { NextResponse } from 'next/server'
import { getAllModels } from '@/lib/pricing-service'

export async function GET() {
  return NextResponse.json(getAllModels())
}
