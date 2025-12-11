import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { convertCurrency, getExchangeRates } from "@/lib/currency";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  const income = await prisma.income.findUnique({
    where: { id },
  });

  if (!income || income.userId !== user.userId) {
    return NextResponse.json({ error: "Nije pronađeno" }, { status: 404 });
  }

  await prisma.income.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Prihod obrisan" });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
    }

    const { id } = await params;

    const income = await prisma.income.findUnique({
      where: { id },
    });

    if (!income || income.userId !== user.userId) {
      return NextResponse.json({ error: "Nije pronađeno" }, { status: 404 });
    }

    const body = await request.json();
    const { amount, description, date, categoryId, loanRepaymentAmount, currency, note, isRecurring, recurringType, nextRecurringDate } = body;

    // Konvertuj u RSD za statistike
    const incomeCurrency = currency || "RSD"
    let amountInRSD = amount ? parseFloat(amount) : income.amount
    
    if (amount && incomeCurrency !== "RSD") {
      try {
        const rates = await getExchangeRates()
        amountInRSD = await convertCurrency(parseFloat(amount), incomeCurrency, "RSD")
        console.log(`💱 Converted ${amount} ${incomeCurrency} to ${amountInRSD} RSD`)
      } catch (error) {
        console.error('Error converting currency:', error)
        // Ako konverzija ne uspe, koristi originalni iznos
      }
    }

    const updateData: any = {
      ...(amount !== undefined && { amount: parseFloat(amount), amountInRSD: amountInRSD }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(currency !== undefined && { currency }),
      ...(note !== undefined && { note }),
      ...(loanRepaymentAmount !== undefined && { 
        loanRepaymentAmount: loanRepaymentAmount ? parseFloat(loanRepaymentAmount) : null 
      }),
    }

    if (categoryId !== undefined) {
      updateData.category = {
        connect: { id: categoryId }
      }
    }

    // Prvo ažuriraj osnovne income podatke
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        recurringIncome: true,
      },
    });

    // Ako je isRecurring true, kreiraj ili ažuriraj RecurringIncome
    if (isRecurring && recurringType && nextRecurringDate) {
      if (updatedIncome.recurringIncome) {
        // Ažuriraj postojeći recurring income
        await prisma.recurringIncome.update({
          where: { id: updatedIncome.recurringIncome.id },
          data: {
            frequency: recurringType,
            nextExecutionAt: new Date(nextRecurringDate),
            amount: parseFloat(amount),
            description,
          }
        })
      } else {
        // Kreiraj novi recurring income
        await prisma.recurringIncome.create({
          data: {
            userId: user.userId,
            amount: parseFloat(amount),
            description,
            frequency: recurringType,
            nextExecutionAt: new Date(nextRecurringDate),
            categoryId: categoryId,
            incomes: {
              connect: { id: updatedIncome.id }
            }
          }
        })
      }
    } else if (!isRecurring && updatedIncome.recurringIncome) {
      // Ako je isRecurring false, obriši RecurringIncome vezu
      await prisma.income.update({
        where: { id: updatedIncome.id },
        data: {
          recurringIncome: {
            disconnect: true
          }
        }
      })
    }

    // Vrati ažurirani income sa relacijom
    const finalIncome = await prisma.income.findUnique({
      where: { id: updatedIncome.id },
      include: {
        category: true,
        recurringIncome: true,
      }
    })

    return NextResponse.json(finalIncome);
  } catch (error) {
    console.error('PUT /api/incomes/[id] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

