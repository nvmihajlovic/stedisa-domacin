import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Export expenses and incomes to CSV format
 * Query params:
 * - startDate: ISO date string (optional, defaults to 30 days ago)
 * - endDate: ISO date string (optional, defaults to today)
 * - type: 'expense' | 'income' | 'all' (optional, defaults to 'all')
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Neautorizovano" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    
    // Parse query parameters
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!)
      : new Date()
    
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    const type = searchParams.get('type') || 'all' // 'expense' | 'income' | 'all'

    let csvData = ''
    let csvRows: string[] = []

    // Export expenses
    if (type === 'expense' || type === 'all') {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true,
          group: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      if (expenses.length > 0) {
        csvRows.push('TIP,DATUM,OPIS,IZNOS,VALUTA,KATEGORIJA,GRUPA,NAPOMENA')
        
        for (const exp of expenses) {
          const row = [
            'Rashod',
            exp.date.toISOString().split('T')[0], // YYYY-MM-DD format
            `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
            exp.amount.toString(),
            exp.currency || 'RSD',
            exp.category?.name || 'Ostalo',
            exp.group?.name || 'N/A',
            exp.note ? `"${exp.note.replace(/"/g, '""')}"` : 'N/A'
          ]
          csvRows.push(row.join(','))
        }
      }
    }

    // Export incomes
    if (type === 'income' || type === 'all') {
      const incomes = await prisma.income.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        }
      })

      if (incomes.length > 0) {
        // If we already have expenses, add a blank line separator
        if (csvRows.length > 0) {
          csvRows.push('')
        }
        
        csvRows.push('TIP,DATUM,OPIS,IZNOS,VALUTA,KATEGORIJA,NAPOMENA')
        
        for (const inc of incomes) {
          const row = [
            'Prihod',
            inc.date.toISOString().split('T')[0],
            `"${inc.description.replace(/"/g, '""')}"`,
            inc.amount.toString(),
            inc.currency || 'RSD',
            inc.category?.name || 'Ostalo',
            inc.note ? `"${inc.note.replace(/"/g, '""')}"` : 'N/A'
          ]
          csvRows.push(row.join(','))
        }
      }
    }

    if (csvRows.length === 0) {
      return NextResponse.json(
        { error: "Nema podataka za eksport u odabranom periodu" },
        { status: 404 }
      )
    }

    csvData = csvRows.join('\n')

    // Add BOM for UTF-8 encoding (important for Excel to read Serbian characters correctly)
    const bom = '\uFEFF'
    const csvContent = bom + csvData

    // Create filename with date range
    const filename = `domaćin_export_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json(
      { error: "Greška pri eksportu podataka" },
      { status: 500 }
    )
  }
}
