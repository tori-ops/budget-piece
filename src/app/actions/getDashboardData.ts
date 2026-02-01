'use server';

import { prisma } from '@/lib/prisma';

export async function getEventDashboardData(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        scenarios: {
          where: { isPrimary: true },
          include: {
            allocations: {
              include: {
                category: {
                  select: { id: true, name: true, group: true, baseWeight: true },
                },
              },
            },
          },
        },
        eventCategories: {
          where: { isEnabled: true },
          include: {
            category: { select: { id: true, name: true, group: true } },
          },
        },
      },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const scenario = event.scenarios[0];
    if (!scenario) {
      return { success: false, error: 'No budget scenario found' };
    }

    // Group allocations by category group
    const allocationsByGroup: Record<string, any[]> = {};
    
    scenario.allocations.forEach((allocation) => {
      const group = allocation.category.group;
      if (!allocationsByGroup[group]) {
        allocationsByGroup[group] = [];
      }
      allocationsByGroup[group].push({
        categoryId: allocation.categoryId,
        categoryName: allocation.category.name,
        categoryGroup: allocation.category.group,
        allocatedCents: allocation.allocatedCents,
        baseWeight: allocation.category.baseWeight,
      });
    });

    const totalAllocated = scenario.allocations.reduce(
      (sum, a) => sum + a.allocatedCents,
      0
    );

    return {
      success: true,
      data: {
        eventId: event.id,
        title: event.title,
        weddingDate: event.weddingDate,
        timezone: event.timezone,
        totalBudgetCents: scenario.totalBudgetCents,
        totalAllocatedCents: totalAllocated,
        allocationsByGroup,
        categoryCount: event.eventCategories.length,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    };
  }
}
