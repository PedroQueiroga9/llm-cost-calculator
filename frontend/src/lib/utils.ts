import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtUSD(value: number, decimals?: number): string {
  if (value === 0) return '$0.00'
  if (value < 0.000001) return `$${value.toFixed(8)}`
  if (value < 0.0001) return `$${value.toFixed(6)}`
  if (value < 0.01) return `$${value.toFixed(5)}`
  if (value < 1) return `$${value.toFixed(4)}`
  if (decimals !== undefined) return `$${value.toFixed(decimals)}`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function fmtNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value))
}

export function fmtTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}k`
  return String(tokens)
}

export function fmtContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M tokens`
  return `${tokens / 1_000}k tokens`
}

export const PROVIDER_COLORS: Record<string, string> = {
  anthropic: '#d97706',
  openai:    '#10b981',
  google:    '#3b82f6',
  xai:       '#6b7280',
  groq:      '#f59e0b',
  deepseek:  '#8b5cf6',
  mistral:   '#ef4444',
}

export const TIER_LABELS: Record<string, string> = {
  economy:  'Econômico',
  standard: 'Padrão',
  premium:  'Premium',
  frontier: 'Frontier',
}

export const TIER_ORDER: Record<string, number> = {
  economy: 0, standard: 1, premium: 2, frontier: 3,
}
