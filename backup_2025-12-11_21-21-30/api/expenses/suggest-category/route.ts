import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { suggestCategory, learnFromUserChoice } from '@/lib/categorySuggestion';

/**
 * POST /api/expenses/suggest-category
 * Get intelligent category suggestion based on OCR text or description
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ocrText, description } = body;

    if (!ocrText && !description) {
      return NextResponse.json(
        { error: 'Missing ocrText or description' },
        { status: 400 }
      );
    }

    // Get category suggestion
    const suggestion = await suggestCategory(
      user.userId,
      ocrText || '',
      description
    );

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error suggesting category:', error);
    return NextResponse.json(
      { error: 'Failed to suggest category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses/suggest-category
 * Learn from user's category choice
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vendorName, categoryId, wasCorrectSuggestion } = body;

    if (!vendorName || !categoryId) {
      return NextResponse.json(
        { error: 'Missing vendorName or categoryId' },
        { status: 400 }
      );
    }

    // Learn from user's choice
    await learnFromUserChoice(
      user.userId,
      vendorName,
      categoryId,
      wasCorrectSuggestion === true
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error learning from user choice:', error);
    return NextResponse.json(
      { error: 'Failed to record learning' },
      { status: 500 }
    );
  }
}
