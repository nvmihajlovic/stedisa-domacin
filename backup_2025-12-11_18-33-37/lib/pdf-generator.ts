import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ExpenseData {
  date: string
  description: string
  amount: number
  category: string
}

interface PDFReportData {
  title: string
  period: string
  totalIncome: number
  totalExpense: number
  balance: number
  expenses: ExpenseData[]
  incomes: ExpenseData[]
  expensesByCategory: Array<{ name: string; total: number; percentage: number }>
}

export async function generatePDFReport(data: PDFReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Minimalist colors
  const black = [20, 20, 20]
  const gray = [120, 120, 120]
  const lightGray = [240, 240, 240]
  const purple = [159, 112, 255]
  const green = [27, 217, 106]
  const red = [255, 107, 129]

  let yPosition = 30

  // Header - Simple and clean
  doc.setFontSize(24)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text('Finansijski izveštaj', 20, yPosition)

  // Period - subtle
  yPosition += 8
  doc.setFontSize(10)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text(data.period, 20, yPosition)

  // Thin separator line
  yPosition += 5
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.3)
  doc.line(20, yPosition, pageWidth - 20, yPosition)

  // Summary - Simple cards with borders
  yPosition += 15
  const cardWidth = (pageWidth - 60) / 3
  const cardHeight = 28
  const cardSpacing = 10

  // Income
  doc.setDrawColor(...green)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, yPosition, cardWidth, cardHeight, 2, 2, 'S')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('PRIHODI', 25, yPosition + 7)
  doc.setFontSize(16)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.totalIncome.toLocaleString('sr-RS')}`, 25, yPosition + 17)
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('RSD', 25, yPosition + 23)

  // Expense
  const expX = 20 + cardWidth + cardSpacing
  doc.setDrawColor(...red)
  doc.roundedRect(expX, yPosition, cardWidth, cardHeight, 2, 2, 'S')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('TROŠKOVI', expX + 5, yPosition + 7)
  doc.setFontSize(16)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.totalExpense.toLocaleString('sr-RS')}`, expX + 5, yPosition + 17)
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('RSD', expX + 5, yPosition + 23)

  // Balance
  const balX = expX + cardWidth + cardSpacing
  const balColor = data.balance >= 0 ? green : red
  doc.setDrawColor(...balColor)
  doc.roundedRect(balX, yPosition, cardWidth, cardHeight, 2, 2, 'S')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('BILANS', balX + 5, yPosition + 7)
  doc.setFontSize(16)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.balance.toLocaleString('sr-RS')}`, balX + 5, yPosition + 17)
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.text('RSD', balX + 5, yPosition + 23)

  // Categories section
  yPosition += 45
  doc.setFontSize(12)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text('Troškovi po kategorijama', 20, yPosition)

  yPosition += 10
  if (data.expensesByCategory.length > 0) {
    data.expensesByCategory.slice(0, 5).forEach((cat) => {
      // Category name and amount on same line
      doc.setFontSize(9)
      doc.setTextColor(...black)
      doc.setFont('helvetica', 'normal')
      doc.text(cat.name, 20, yPosition)
      doc.text(`${cat.total.toLocaleString('sr-RS')} RSD`, pageWidth - 35, yPosition, { align: 'right' })
      
      // Percentage
      doc.setTextColor(...gray)
      doc.setFont('helvetica', 'bold')
      doc.text(`${cat.percentage.toFixed(0)}%`, pageWidth - 20, yPosition, { align: 'right' })

      // Simple progress bar
      yPosition += 4
      const barMaxWidth = pageWidth - 40
      const barWidth = barMaxWidth * (cat.percentage / 100)
      
      doc.setFillColor(...lightGray)
      doc.rect(20, yPosition, barMaxWidth, 2, 'F')
      
      doc.setFillColor(...black)
      doc.rect(20, yPosition, barWidth, 2, 'F')

      yPosition += 9
    })
  }

  // Expense table
  yPosition += 10
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = 30
  }

  doc.setFontSize(12)
  doc.setTextColor(...black)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalji troškova', 20, yPosition)

  // Table header
  yPosition += 8
  doc.setFillColor(...lightGray)
  doc.rect(20, yPosition - 4, pageWidth - 40, 8, 'F')
  
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'bold')
  doc.text('DATUM', 24, yPosition)
  doc.text('OPIS', 50, yPosition)
  doc.text('KATEGORIJA', 120, yPosition)
  doc.text('IZNOS', pageWidth - 24, yPosition, { align: 'right' })

  yPosition += 8
  doc.setFont('helvetica', 'normal')

  data.expenses.slice(0, 25).forEach((expense, idx) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage()
      yPosition = 30
    }

    doc.setFontSize(8)
    doc.setTextColor(...gray)
    const date = new Date(expense.date).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' })
    doc.text(date, 24, yPosition)

    doc.setTextColor(...black)
    const desc = expense.description.length > 35 ? expense.description.substring(0, 35) + '...' : expense.description
    doc.text(desc, 50, yPosition)

    doc.setTextColor(...gray)
    const cat = expense.category.length > 20 ? expense.category.substring(0, 20) + '...' : expense.category
    doc.text(cat, 120, yPosition)

    doc.setTextColor(...black)
    doc.setFont('helvetica', 'bold')
    doc.text(`${expense.amount.toLocaleString('sr-RS')}`, pageWidth - 24, yPosition, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    yPosition += 7

    // Subtle separator every 5 rows
    if ((idx + 1) % 5 === 0) {
      doc.setDrawColor(...lightGray)
      doc.setLineWidth(0.1)
      doc.line(20, yPosition - 3, pageWidth - 20, yPosition - 3)
    }
  })

  // Footer - minimal
  const footerY = pageHeight - 15
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  const genDate = new Date().toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(`Generisano ${genDate}`, pageWidth / 2, footerY, { align: 'center' })

  return doc.output('blob')
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
