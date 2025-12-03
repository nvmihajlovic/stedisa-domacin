import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

/**
 * GET /api/expenses/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&categoryId=xxx&format=xlsx
 * Exports expenses to Excel/CSV format
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const expenseIds = searchParams.get("expenseIds");
    const format = searchParams.get("format") || "xlsx"; // xlsx or csv

    // Build where clause
    const where: any = {
      userId: user.userId,
    };

    // If specific expense IDs are provided, use them directly
    if (expenseIds) {
      where.id = {
        in: expenseIds.split(',').filter(id => id.trim() !== '')
      };
    } else {
      // Otherwise use date and category filters
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }
    }

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (expenses.length === 0) {
      return NextResponse.json(
        { error: "Nema troškova za export" },
        { status: 404 }
      );
    }

    // Format data for Excel/CSV
    const data = expenses.map((expense) => ({
      "Datum": new Date(expense.date).toLocaleDateString('sr-RS'),
      "Opis": expense.description,
      "Iznos (RSD)": expense.amount.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Kategorija": expense.category.name,
      "Način plaćanja": expense.paymentMethod || "Gotovina",
      "Napomena": expense.note || "",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const maxWidth = 30;
    const columnWidths = [
      { wch: 12 }, // Datum
      { wch: 25 }, // Opis
      { wch: 15 }, // Iznos
      { wch: 20 }, // Kategorija
      { wch: 18 }, // Način plaćanja
      { wch: maxWidth }, // Napomena
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Troškovi");

    // Generate buffer
    let buffer: Buffer;
    let mimeType: string;
    let filename: string;

    if (format === "csv") {
      // Generate CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      buffer = Buffer.from(csv, 'utf-8');
      mimeType = "text/csv";
      filename = `troskovi_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // Generate Excel (XLSX)
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      buffer = Buffer.from(excelBuffer);
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `troskovi_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    // Return file as download
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Greška pri exportu troškova" },
      { status: 500 }
    );
  }
}
