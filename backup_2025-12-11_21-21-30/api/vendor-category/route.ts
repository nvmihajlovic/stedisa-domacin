import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * GET /api/vendor-category?vendorName=XXX
 * Returns the user's previously saved category for this vendor
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorName = searchParams.get("vendorName");

    if (!vendorName) {
      return NextResponse.json({ error: "vendorName is required" }, { status: 400 });
    }

    // Find user's previous mapping for this vendor
    const mapping = await prisma.vendorCategoryMapping.findUnique({
      where: {
        userId_vendorName: {
          userId: user.userId,
          vendorName: vendorName,
        },
      },
      include: {
        category: true,
      },
    });

    if (!mapping) {
      return NextResponse.json({ 
        hasSavedCategory: false,
        message: "Nema sačuvane kategorije za ovog vendora"
      });
    }

    return NextResponse.json({
      hasSavedCategory: true,
      categoryId: mapping.categoryId,
      categoryName: mapping.category.name,
      usageCount: mapping.usageCount,
      lastUsedAt: mapping.lastUsedAt,
    });
  } catch (error) {
    console.error("Error fetching vendor category mapping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendor-category
 * Saves or updates the user's category preference for a vendor
 * Body: { vendorName: string, categoryId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorName, categoryId } = await req.json();

    if (!vendorName || !categoryId) {
      return NextResponse.json(
        { error: "vendorName and categoryId are required" },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.userId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found or does not belong to user" },
        { status: 404 }
      );
    }

    // Upsert the mapping (create if doesn't exist, update if exists)
    const mapping = await prisma.vendorCategoryMapping.upsert({
      where: {
        userId_vendorName: {
          userId: user.userId,
          vendorName: vendorName,
        },
      },
      update: {
        categoryId: categoryId,
        usageCount: {
          increment: 1,
        },
        lastUsedAt: new Date(),
      },
      create: {
        userId: user.userId,
        vendorName: vendorName,
        categoryId: categoryId,
        usageCount: 1,
      },
      include: {
        category: true,
      },
    });

    console.log(`✅ Saved vendor→category mapping: ${vendorName} → ${category.name}`);

    return NextResponse.json({
      success: true,
      mapping: {
        vendorName: mapping.vendorName,
        categoryId: mapping.categoryId,
        categoryName: mapping.category.name,
        usageCount: mapping.usageCount,
      },
    });
  } catch (error) {
    console.error("Error saving vendor category mapping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
