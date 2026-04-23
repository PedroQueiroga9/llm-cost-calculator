import { NextResponse } from 'next/server'
import { getProviders } from '@/lib/pricing-service'

export async function GET() {
  return NextResponse.json(getProviders())
}
