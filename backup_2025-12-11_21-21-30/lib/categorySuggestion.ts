/**
 * Category Suggestion Engine
 * Combines multiple sources to intelligently suggest expense categories
 */

import { prisma } from './prisma';
import { findMerchantMatch, extractVendorName, normalizeText } from './merchantDatabase';

export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  source: 'merchant_db' | 'user_learning' | 'keyword_match' | 'recent_expense';
  vendorName?: string;
}

/**
 * Main function to get category suggestion based on OCR text
 */
export async function suggestCategory(
  userId: string,
  ocrText: string,
  description?: string
): Promise<CategorySuggestion | null> {
  const suggestions: CategorySuggestion[] = [];

  console.log('\n🔍 === CATEGORY SUGGESTION START ===');
  console.log('📝 Input:', { userId, ocrTextLength: ocrText.length, description });

  // Extract vendor name from OCR text
  const vendorName = extractVendorName(ocrText);
  const searchText = description || ocrText;
  
  console.log('🏪 Extracted vendor:', vendorName);
  console.log('🔎 Search text:', searchText.substring(0, 100) + '...');

  // 1. Check Merchant Database (Highest Priority)
  console.log('\n1️⃣ Checking Merchant Database...');
  const merchantMatch = findMerchantMatch(searchText);
  console.log('🔍 Merchant match result:', merchantMatch);
  
  if (merchantMatch) {
    console.log(`✅ Found merchant: "${merchantMatch.category}" (confidence: ${merchantMatch.confidence})`);
    
    const category = await prisma.category.findFirst({
      where: {
        userId,
        name: merchantMatch.category,
        isActive: true,
      },
    });

    console.log(`🔍 Database lookup for "${merchantMatch.category}":`, category ? `Found (ID: ${category.id})` : 'NOT FOUND');

    if (category) {
      suggestions.push({
        categoryId: category.id,
        categoryName: category.name,
        confidence: merchantMatch.confidence,
        source: 'merchant_db',
        vendorName: vendorName || undefined,
      });
      console.log(`✅ Added merchant_db suggestion: ${category.name}`);
    } else {
      console.log(`⚠️ Category "${merchantMatch.category}" not found in user's categories`);
    }
  } else {
    console.log('❌ No merchant match found');
  }

  // 2. Check User Learning (VendorCategoryMapping)
  if (vendorName) {
    const normalizedVendor = normalizeText(vendorName);
    const userMapping = await prisma.vendorCategoryMapping.findFirst({
      where: {
        userId,
        vendorName: normalizedVendor,
      },
      include: {
        category: true,
      },
      orderBy: {
        usageCount: 'desc',
      },
    });

    if (userMapping && userMapping.category.isActive) {
      // User's own patterns have high confidence after multiple uses
      const mappingConfidence = (userMapping as any).confidence || 0.7;
      const confidence = Math.min(0.95, mappingConfidence + (userMapping.usageCount * 0.02));
      
      suggestions.push({
        categoryId: userMapping.category.id,
        categoryName: userMapping.category.name,
        confidence,
        source: 'user_learning',
        vendorName,
      });
    }
  }

  // 3. Keyword Matching in Description
  const keywordMatch = await matchKeywordsToCategory(userId, searchText);
  if (keywordMatch) {
    suggestions.push(keywordMatch);
  }

  // 4. Check Recent Similar Expenses
  const recentMatch = await findSimilarRecentExpense(userId, searchText);
  if (recentMatch) {
    suggestions.push(recentMatch);
  }

  // Sort by confidence and return best match
  if (suggestions.length === 0) {
    console.log('\n❌ No suggestions found');
    console.log('=== CATEGORY SUGGESTION END ===\n');
    return null;
  }

  suggestions.sort((a, b) => b.confidence - a.confidence);
  console.log(`\n✅ Returning best suggestion: ${suggestions[0].categoryName} (${suggestions[0].confidence})`);
  console.log('=== CATEGORY SUGGESTION END ===\n');
  return suggestions[0];
}

/**
 * Match keywords in text to category patterns
 */
async function matchKeywordsToCategory(
  userId: string,
  text: string
): Promise<CategorySuggestion | null> {
  const normalized = normalizeText(text);

  // Get all user categories
  const categories = await prisma.category.findMany({
    where: { userId, isActive: true },
  });

  // Category keyword patterns
  const categoryKeywords: Record<string, string[]> = {
    'Hrana i piće': [
      'hrana', 'piće', 'market', 'supermarket', 'pekara', 'bread', 'hleb',
      'prodavnica', 'groceries', 'food', 'drink'
    ],
    'Gorivo': [
      'gorivo', 'benzin', 'dizel', 'fuel', 'petrol', 'gas', 'pumpa'
    ],
    'Stanovanje i komunalije': [
      'eps', 'elektroprivreda', 'struja', 'električna energija',
      'srbijagas', 'gas', 'grejanje', 'toplana',
      'vodovod', 'voda', 'kanalizacija', 'bvk',
      'sbb', 'internet', 'kablovska', 'tv pretplata',
      'telekom', 'fiksni telefon',
      'komunalije', 'režije', 'račun', 'računi', 'stanarina', 'stanovanje'
    ],
    'Stanarina i komunalije': [
      'eps', 'elektroprivreda', 'struja', 'električna energija',
      'srbijagas', 'gas', 'grejanje', 'toplana',
      'vodovod', 'voda', 'kanalizacija', 'bvk',
      'sbb', 'internet', 'kablovska', 'tv pretplata',
      'telekom', 'fiksni telefon',
      'komunalije', 'režije', 'račun', 'računi', 'stanarina'
    ],
    'Režije': [
      'eps', 'elektroprivreda', 'struja', 'električna energija',
      'srbijagas', 'gas', 'grejanje', 'toplana',
      'vodovod', 'voda', 'kanalizacija', 'bvk',
      'sbb', 'internet', 'kablovska', 'tv pretplata',
      'telekom', 'fiksni telefon',
      'komunalije', 'režije', 'račun', 'računi'
    ],
    'Restoran/Kafić': [
      'restoran', 'restaurant', 'kafić', 'caffe', 'cafe', 'bar',
      'pizza', 'burger', 'food', 'lunch', 'dinner', 'breakfast'
    ],
    'Zdravlje': [
      'apoteka', 'pharmacy', 'lek', 'medicine', 'doktor', 'doctor',
      'klinika', 'hospital', 'zdravlje', 'health'
    ],
    'Lepota i nega': [
      'šminka', 'makeup', 'parfem', 'perfume', 'kozmetika', 'cosmetics',
      'nega', 'beauty', 'frizerski'
    ],
    'Odeća i obuća': [
      'odeća', 'clothes', 'obuća', 'shoes', 'patike', 'cipele',
      'majica', 'shirt', 'pantalone', 'pants', 'jakna'
    ],
    'Tehnika': [
      'tehnika', 'electronics', 'telefon', 'phone', 'laptop',
      'kompjuter', 'computer', 'TV', 'tablet'
    ],
    'Kuća i dom': [
      'nameštaj', 'furniture', 'kuhinja', 'kitchen', 'dekoracija',
      'alat', 'tools', 'bašta', 'garden'
    ],
    'Prevoz': [
      'prevoz', 'transport', 'autobus', 'bus', 'taxi', 'voz', 'train',
      'parking', 'kartica', 'ticket'
    ],
    'Obrazovanje': [
      'knjiga', 'book', 'škola', 'school', 'kurs', 'course',
      'obuka', 'training', 'sveska', 'notebook'
    ],
    'Zabava': [
      'bioskop', 'cinema', 'teretana', 'gym', 'sport', 'igra', 'game',
      'koncert', 'concert', 'pozorište', 'theater'
    ],
    'Kućni ljubimci': [
      'pas', 'dog', 'mačka', 'cat', 'ljubimac', 'pet', 'hrana za pse',
      'veterinar', 'vet'
    ],
  };

  // Find best matching category
  let bestMatch: { category: typeof categories[0]; score: number } | null = null;

  for (const category of categories) {
    const keywords = categoryKeywords[category.name] || [];
    let matchCount = 0;

    for (const keyword of keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const score = matchCount / keywords.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }
  }

  if (bestMatch && bestMatch.score > 0.1) {
    return {
      categoryId: bestMatch.category.id,
      categoryName: bestMatch.category.name,
      confidence: Math.min(0.75, 0.4 + bestMatch.score * 0.5),
      source: 'keyword_match',
    };
  }

  return null;
}

/**
 * Find similar recent expenses to learn from user's patterns
 */
async function findSimilarRecentExpense(
  userId: string,
  text: string
): Promise<CategorySuggestion | null> {
  const normalized = normalizeText(text);
  const words = normalized.split(' ').filter(w => w.length > 3);

  if (words.length === 0) return null;

  // Get recent expenses (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentExpenses = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 100,
  });

  // Find expense with similar description
  for (const expense of recentExpenses) {
    const expenseDesc = normalizeText(expense.description);
    
    // Check if any significant word matches
    let matchedWords = 0;
    for (const word of words) {
      if (expenseDesc.includes(word)) {
        matchedWords++;
      }
    }

    const similarity = matchedWords / words.length;
    
    if (similarity > 0.5 && expense.category.isActive) {
      return {
        categoryId: expense.category.id,
        categoryName: expense.category.name,
        confidence: Math.min(0.70, 0.4 + similarity * 0.4),
        source: 'recent_expense',
      };
    }
  }

  return null;
}

/**
 * Learn from user's category choice
 * Updates VendorCategoryMapping when user confirms a suggestion or manually selects
 */
export async function learnFromUserChoice(
  userId: string,
  vendorName: string,
  categoryId: string,
  wasCorrectSuggestion: boolean
): Promise<void> {
  const normalized = normalizeText(vendorName);

  // Find or create vendor mapping
  const existingMapping = await prisma.vendorCategoryMapping.findUnique({
    where: {
      userId_vendorName: {
        userId,
        vendorName: normalized,
      },
    },
  });

  if (existingMapping) {
    // Update existing mapping
    const currentConfidence = (existingMapping as any).confidence || 0.7;
    const newConfidence = wasCorrectSuggestion 
      ? Math.min(0.98, currentConfidence + 0.05)
      : Math.max(0.6, currentConfidence - 0.1);
    
    await prisma.vendorCategoryMapping.update({
      where: { id: existingMapping.id },
      data: {
        categoryId,
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
        ...(newConfidence !== undefined && { confidence: newConfidence } as any),
      },
    });
  } else {
    // Create new mapping
    await prisma.vendorCategoryMapping.create({
      data: {
        userId,
        vendorName: normalized,
        categoryId,
        usageCount: 1,
        lastUsedAt: new Date(),
        ...(wasCorrectSuggestion ? { confidence: 0.8 } : { confidence: 0.6 }) as any,
      },
    });
  }
}

/**
 * Get all learned vendor mappings for a user
 */
export async function getUserVendorMappings(userId: string) {
  return await prisma.vendorCategoryMapping.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: [
      { usageCount: 'desc' },
      { lastUsedAt: 'desc' },
    ],
  });
}
