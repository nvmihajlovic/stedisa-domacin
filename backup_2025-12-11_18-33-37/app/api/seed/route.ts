import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  // Check if user already has categories
  const existingCategories = await prisma.category.count({
    where: { userId: user.userId }
  });

  if (existingCategories > 0) {
    return NextResponse.json({ message: "Kategorije već postoje" });
  }

  // Predefined expense categories - 27 total per specification
  const expenseCategories = [
    { name: "hrana i piće", icon: "ForkKnife", color: "#FF6B6B" },
    { name: "gorivo", icon: "GasPump", color: "#FFA500" },
    { name: "hemija", icon: "Drop", color: "#95E1D3" },
    { name: "kozmetika", icon: "Sparkle", color: "#FF85A2" },
    { name: "odeća", icon: "TShirt", color: "#A8E6CF" },
    { name: "obuća", icon: "ShoppingBag", color: "#FFD93D" },
    { name: "komunalije", icon: "House", color: "#4C8BEA" },
    { name: "energija", icon: "Lightning", color: "#FFE66D" },
    { name: "pokućstvo", icon: "Armchair", color: "#C490E4" },
    { name: "restorani", icon: "ForkKnife", color: "#FF6B9D" },
    { name: "zabava", icon: "FilmSlate", color: "#A8D8EA" },
    { name: "putovanje", icon: "AirplaneTilt", color: "#FFB6C1" },
    { name: "stanarina", icon: "Buildings", color: "#B4A7D6" },
    { name: "pokloni", icon: "Gift", color: "#FFAAA5" },
    { name: "kredit", icon: "CreditCard", color: "#E4586E" },
    { name: "lična nega", icon: "User", color: "#F8B195" },
    { name: "rekreacija", icon: "Barbell", color: "#92A8D1" },
    { name: "održavanje doma", icon: "Wrench", color: "#88B04B" },
    { name: "održavanje vozila", icon: "Car", color: "#5B84B1" },
    { name: "registracija vozila", icon: "FileText", color: "#FC766A" },
    { name: "školarina", icon: "GraduationCap", color: "#5F4B8B" },
    { name: "porezi", icon: "ChartBar", color: "#E69A8D" },
    { name: "osiguranje", icon: "ShieldCheck", color: "#42EADD" },
    { name: "bankarski troškovi", icon: "Bank", color: "#CDB599" },
    { name: "alimentacija", icon: "UsersThree", color: "#DD4A48" },
    { name: "pretplate", icon: "DeviceMobile", color: "#9F70FF" },
    { name: "ostalo", icon: "Package", color: "#7A7A8C" },
  ];

  // Predefined income categories - 5 total per specification
  const incomeCategories = [
    { name: "lični dohodak", icon: "Money", color: "#45D38A", isLoanRepayment: false },
    { name: "prihod od rente", icon: "Buildings", color: "#2ECC71", isLoanRepayment: false },
    { name: "honorar", icon: "CurrencyCircleDollar", color: "#27AE60", isLoanRepayment: false },
    { name: "napojnica", icon: "Hand", color: "#1ABC9C", isLoanRepayment: false },
    { name: "ostalo", icon: "TrendUp", color: "#16A085", isLoanRepayment: false },
  ];

  // Create expense categories
  await prisma.category.createMany({
    data: expenseCategories.map(cat => ({
      ...cat,
      userId: user.userId
    }))
  });

  // Create income categories
  await prisma.incomeCategory.createMany({
    data: incomeCategories.map(cat => ({
      ...cat,
      userId: user.userId
    }))
  });

  return NextResponse.json({
    message: "Kategorije uspešno kreirane",
    expenseCount: expenseCategories.length,
    incomeCount: incomeCategories.length
  });
}
