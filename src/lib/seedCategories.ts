import { prisma } from '@/lib/prisma';

const MASTER_CATEGORIES = [
  // CORE (12)
  { id: 'cat_001', name: 'Venue & Rentals', group: 'CORE', baseWeight: 0.20 },
  { id: 'cat_002', name: 'Catering / Food', group: 'CORE', baseWeight: 0.18 },
  { id: 'cat_003', name: 'Bar / Alcohol', group: 'CORE', baseWeight: 0.08 },
  { id: 'cat_004', name: 'Photography', group: 'CORE', baseWeight: 0.12 },
  { id: 'cat_005', name: 'Videography', group: 'CORE', baseWeight: 0.08 },
  { id: 'cat_006', name: 'Planner / Coordination', group: 'CORE', baseWeight: 0.06 },
  { id: 'cat_007', name: 'Attire', group: 'CORE', baseWeight: 0.08 },
  { id: 'cat_008', name: 'Florals', group: 'CORE', baseWeight: 0.07 },
  { id: 'cat_009', name: 'Music / Entertainment', group: 'CORE', baseWeight: 0.07 },
  { id: 'cat_010', name: 'Officiant', group: 'CORE', baseWeight: 0.01 },
  { id: 'cat_011', name: 'Cake / Desserts', group: 'CORE', baseWeight: 0.03 },
  { id: 'cat_012', name: 'Hair & Makeup', group: 'CORE', baseWeight: 0.02 },

  // ADMIN (5)
  { id: 'cat_013', name: 'Taxes, Service Fees & Delivery', group: 'ADMIN', baseWeight: 0.06 },
  { id: 'cat_014', name: 'Tips / Gratuities', group: 'ADMIN', baseWeight: 0.05 },
  { id: 'cat_015', name: 'Permits & Licenses', group: 'ADMIN', baseWeight: 0.01 },
  { id: 'cat_016', name: 'Postage & Mailing', group: 'ADMIN', baseWeight: 0.01 },
  { id: 'cat_017', name: 'Insurance', group: 'ADMIN', baseWeight: 0.02 },

  // ENHANCEMENTS (8)
  { id: 'cat_018', name: 'Decor Enhancements (Non-floral)', group: 'ENHANCEMENTS', baseWeight: 0.04 },
  { id: 'cat_019', name: 'Signage & Stationery', group: 'ENHANCEMENTS', baseWeight: 0.01 },
  { id: 'cat_020', name: 'Lighting & Draping', group: 'ENHANCEMENTS', baseWeight: 0.03 },
  { id: 'cat_021', name: 'Transportation', group: 'ENHANCEMENTS', baseWeight: 0.03 },
  { id: 'cat_022', name: 'Guest Experience', group: 'ENHANCEMENTS', baseWeight: 0.02 },
  { id: 'cat_023', name: 'Favors', group: 'ENHANCEMENTS', baseWeight: 0.01 },
  { id: 'cat_024', name: 'Late-Night Snack', group: 'ENHANCEMENTS', baseWeight: 0.01 },
  { id: 'cat_025', name: 'Bridal Party Gifts', group: 'ENHANCEMENTS', baseWeight: 0.02 },

  // SAFETY_NET (1)
  { id: 'cat_026', name: 'Contingency / Flex Fund', group: 'SAFETY_NET', baseWeight: 0.10 },

  // FLEX (1)
  { id: 'cat_027', name: 'Miscellaneous / Other', group: 'FLEX', baseWeight: 0.03 },
];

/**
 * Seed the master category catalog (27 global categories)
 * Only call once or idempotently
 */
export async function seedMasterCategories() {
  try {
    for (const cat of MASTER_CATEGORIES) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          group: cat.group,
          baseWeight: cat.baseWeight,
          isGlobal: true,
        },
      });
    }
    console.log(`✅ Seeded ${MASTER_CATEGORIES.length} master categories`);
    return { success: true, count: MASTER_CATEGORIES.length };
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
