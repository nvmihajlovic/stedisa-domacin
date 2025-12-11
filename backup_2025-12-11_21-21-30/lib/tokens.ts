import crypto from 'crypto'

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7) // Token važi 7 dana
  return expiry
}
