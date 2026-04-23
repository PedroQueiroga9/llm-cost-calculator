import { NextRequest, NextResponse } from 'next/server'
import { compareModels } from '@/lib/pricing-service'

export async function POST(req: NextRequest) {
  const { input_tokens, output_tokens, requests_per_day } = await req.json()
  return NextResponse.json(compareModels(input_tokens, output_tokens, requests_per_day))
}
