/**
 * Test script for category suggestion system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import merchant database functions
const { findMerchantMatch, extractVendorName } = require('../lib/merchantDatabase.ts');

async function testCategorySuggestion() {
  console.log('🧪 Testing Category Suggestion System\n');

  // Test 1: Check if user has "Režije" category
  console.log('1️⃣ Checking user categories...');
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ No users found in database');
    return;
  }
  
  const categories = await prisma.category.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true, name: true }
  });
  
  console.log(`✅ Found ${categories.length} categories for user ${user.email}:`);
  categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
  
  const rezije = categories.find(c => c.name === 'Režije');
  if (!rezije) {
    console.log('\n⚠️  User does NOT have "Režije" category!');
    console.log('   Creating it now...');
    
    const newCategory = await prisma.category.create({
      data: {
        userId: user.id,
        name: 'Režije',
        icon: '💡',
        color: '#FFA500',
        isActive: true
      }
    });
    console.log(`✅ Created "Režije" category: ${newCategory.id}`);
  } else {
    console.log(`\n✅ User has "Režije" category: ${rezije.id}`);
  }

  // Test 2: Test merchant database matching
  console.log('\n2️⃣ Testing merchant database matching...');
  const testTexts = [
    'ELEKTROPRIVREDA SRBIJE',
    'EPS',
    'BVK Vodovod',
    'SrbijaGas',
    'Račun za struju',
    'MAXI Market'
  ];

  for (const text of testTexts) {
    console.log(`\n   Testing: "${text}"`);
    try {
      const match = await findMerchantMatch(text);
      if (match) {
        console.log(`   ✅ Match: ${match.category} (confidence: ${match.confidence})`);
      } else {
        console.log(`   ❌ No match found`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Test 3: Test full suggestion system
  console.log('\n3️⃣ Testing full suggestion system...');
  const { suggestCategory } = require('../lib/categorySuggestion.ts');
  
  const epsText = `ELEKTROPRIVREDA SRBIJE
Račun za električnu energiju
Period: Oktobar 2024
Iznos: 4,250.00 RSD`;

  console.log(`\n   OCR Text:\n${epsText}\n`);
  
  try {
    const suggestion = await suggestCategory(user.id, epsText, 'ELEKTROPRIVREDA SRBIJE');
    if (suggestion) {
      console.log(`   ✅ Suggestion: ${suggestion.categoryName}`);
      console.log(`      Category ID: ${suggestion.categoryId}`);
      console.log(`      Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
      console.log(`      Source: ${suggestion.source}`);
    } else {
      console.log(`   ❌ No suggestion returned`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.error(error);
  }

  await prisma.$disconnect();
  console.log('\n✅ Test completed\n');
}

testCategorySuggestion().catch(console.error);
