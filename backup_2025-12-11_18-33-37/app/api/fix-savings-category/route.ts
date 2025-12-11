import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fix ALL users' Štednja categories
    const result = await prisma.category.updateMany({
      where: {
        name: 'Štednja'
      },
      data: {
        isSavings: true
      }
    })

    console.log('✅ Updated Štednja categories:', result)

    // Fetch all Štednja categories to verify
    const stednje = await prisma.category.findMany({
      where: {
        name: 'Štednja'
      },
      select: {
        id: true,
        name: true,
        isSavings: true,
        userId: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.count} category/categories`,
      categories: stednje
    })
  } catch (error: any) {
    console.error('Error fixing savings category:', error)
    return NextResponse.json(
      { error: 'Failed to fix category', details: error.message },
      { status: 500 }
    )
  }
}
