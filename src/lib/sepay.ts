import { SePayPgClient } from 'sepay-pg-node'

export function sepayClient() {
  return new SePayPgClient({
    env: (process.env.SEPAY_ENV as 'sandbox' | 'production') ?? 'sandbox',
    merchant_id: process.env.SEPAY_MERCHANT_ID!,
    secret_key: process.env.SEPAY_SECRET_KEY!,
  })
}
