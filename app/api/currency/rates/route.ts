import { NextResponse } from "next/server"
import { getExchangeRates } from "@/lib/currency"

/**
 * GET /api/currency/rates
 * Vraća trenutne kurseve valuta
 */
export async function GET() {
  try {
    const rates = await getExchangeRates()
    
    return NextResponse.json({
      rates,
      timestamp: Date.now(),
      base: "RSD"
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    )
  }
}
