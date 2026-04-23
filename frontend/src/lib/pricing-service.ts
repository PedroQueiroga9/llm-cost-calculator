import { MODELS_DATA, PROVIDER_META, ModelPricing } from './models-data'

const models = MODELS_DATA.filter((m) => m.is_available)

export function getAllModels(): ModelPricing[] {
  return models
}

export function getModel(modelId: string): ModelPricing | undefined {
  return models.find((m) => m.id === modelId)
}

export function getProviders() {
  const seen = new Set<string>()
  const result = []
  for (const m of models) {
    if (!seen.has(m.provider_id)) {
      seen.add(m.provider_id)
      const meta = PROVIDER_META[m.provider_id] ?? {}
      const modelCount = models.filter((x) => x.provider_id === m.provider_id).length
      result.push({ ...meta, id: m.provider_id, model_count: modelCount })
    }
  }
  return result
}

export function calculateSingle(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  useCache = false,
  useBatch = false,
) {
  const model = getModel(modelId)
  if (!model) throw new Error(`Model not found: ${modelId}`)

  let inputPrice = useCache && model.cached_input_per_m != null ? model.cached_input_per_m : model.input_per_m
  let outputPrice = model.output_per_m

  if (useBatch && model.batch_available) {
    const discount = model.batch_discount / 100
    inputPrice *= 1 - discount
    outputPrice *= 1 - discount
  }

  const costInput = (inputTokens / 1_000_000) * inputPrice
  const costOutput = (outputTokens / 1_000_000) * outputPrice
  const costTotal = costInput + costOutput

  return {
    model_id: modelId,
    model_name: model.name,
    provider: model.provider,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_input_usd: round(costInput, 8),
    cost_output_usd: round(costOutput, 8),
    cost_total_usd: round(costTotal, 8),
    cost_total_brl: round(costTotal * 5.7, 6),
    applied_input_price: inputPrice,
    applied_output_price: outputPrice,
    cache_applied: useCache && model.cached_input_per_m != null,
    batch_applied: useBatch && model.batch_available,
  }
}

export function calculateMonthly(
  modelId: string,
  requestsPerDay: number,
  inputTokensPerReq: number,
  outputTokensPerReq: number,
  useCache = false,
  useBatch = false,
) {
  const single = calculateSingle(modelId, inputTokensPerReq, outputTokensPerReq, useCache, useBatch)
  const totalMonthlyReqs = requestsPerDay * 30
  const monthlyCost = single.cost_total_usd * totalMonthlyReqs

  return {
    ...single,
    requests_per_day: requestsPerDay,
    total_monthly_requests: totalMonthlyReqs,
    total_input_tokens_monthly: inputTokensPerReq * totalMonthlyReqs,
    total_output_tokens_monthly: outputTokensPerReq * totalMonthlyReqs,
    monthly_cost_usd: round(monthlyCost, 4),
    monthly_cost_brl: round(monthlyCost * 5.7, 2),
    annual_cost_usd: round(monthlyCost * 12, 2),
    annual_cost_brl: round(monthlyCost * 12 * 5.7, 2),
    projections: {
      '100_reqs_day': round(single.cost_total_usd * 100 * 30, 4),
      '1000_reqs_day': round(single.cost_total_usd * 1000 * 30, 4),
      '10000_reqs_day': round(single.cost_total_usd * 10000 * 30, 4),
    },
  }
}

export function compareModels(inputTokens: number, outputTokens: number, requestsPerDay = 1000) {
  const results = models.map((model) => {
    const calc = calculateSingle(model.id, inputTokens, outputTokens)
    const monthly = calc.cost_total_usd * requestsPerDay * 30
    return {
      model_id: model.id,
      model_name: model.name,
      provider: model.provider,
      provider_id: model.provider_id,
      tier: model.tier,
      input_per_m: model.input_per_m,
      output_per_m: model.output_per_m,
      context_window: model.context_window,
      cost_per_request_usd: round(calc.cost_total_usd, 8),
      monthly_cost_usd: round(monthly, 4),
      monthly_cost_brl: round(monthly * 5.7, 2),
      batch_available: model.batch_available,
      strengths: model.strengths,
      best_for: model.best_for,
      relative_cost_pct: 0,
    }
  })

  results.sort((a, b) => a.cost_per_request_usd - b.cost_per_request_usd)
  const maxCost = results.reduce((m, r) => Math.max(m, r.cost_per_request_usd), 1)
  results.forEach((r) => {
    r.relative_cost_pct = round((r.cost_per_request_usd / maxCost) * 100, 1)
  })

  return results
}

export function calculateAgentSystem(agents: Array<{
  name: string
  model_id: string
  requests_per_day: number
  input_tokens: number
  output_tokens: number
  use_cache?: boolean
  use_batch?: boolean
}>) {
  let totalDailyUsd = 0
  const breakdown = agents.map((agent) => {
    const calc = calculateSingle(agent.model_id, agent.input_tokens, agent.output_tokens, agent.use_cache, agent.use_batch)
    const dailyCost = calc.cost_total_usd * agent.requests_per_day
    totalDailyUsd += dailyCost
    return {
      agent_name: agent.name,
      model_name: calc.model_name,
      provider: calc.provider,
      requests_per_day: agent.requests_per_day,
      cost_per_request_usd: calc.cost_total_usd,
      daily_cost_usd: round(dailyCost, 6),
      monthly_cost_usd: round(dailyCost * 30, 4),
      monthly_cost_brl: round(dailyCost * 30 * 5.7, 2),
      percentage_of_total: 0,
    }
  })

  breakdown.forEach((item) => {
    item.percentage_of_total = round(totalDailyUsd > 0 ? (item.daily_cost_usd / totalDailyUsd) * 100 : 0, 1)
  })

  const monthlyTotal = totalDailyUsd * 30
  return {
    agents: breakdown,
    total_daily_usd: round(totalDailyUsd, 6),
    total_monthly_usd: round(monthlyTotal, 4),
    total_monthly_brl: round(monthlyTotal * 5.7, 2),
    total_annual_usd: round(monthlyTotal * 12, 2),
    total_annual_brl: round(monthlyTotal * 12 * 5.7, 2),
  }
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals))
}
