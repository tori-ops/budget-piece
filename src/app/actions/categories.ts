'use server';

import { prisma } from '@/lib/prisma';

export async function getCategoriesGrouped() {
  const categories = await prisma.category.findMany({
    where: { isGlobal: true },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });

  const grouped = {
    CORE: categories.filter(c => c.group === 'CORE'),
    ADMIN: categories.filter(c => c.group === 'ADMIN'),
    ENHANCEMENTS: categories.filter(c => c.group === 'ENHANCEMENTS'),
    SAFETY_NET: categories.filter(c => c.group === 'SAFETY_NET'),
    FLEX: categories.filter(c => c.group === 'FLEX'),
  };

  return grouped;
}

export async function saveEventCategories(
  eventId: string,
  selectedCategoryIds: string[]
) {
  try {
    // Delete existing event categories
    await prisma.eventCategory.deleteMany({
      where: { eventId },
    });

    // Create new event categories (all selected as enabled)
    for (const categoryId of selectedCategoryIds) {
      await prisma.eventCategory.create({
        data: {
          eventId,
          categoryId,
          isEnabled: true,
        },
      });
    }

    return { success: true, count: selectedCategoryIds.length };
  } catch (error) {
    console.error('Error saving event categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save categories',
    };
  }
}
