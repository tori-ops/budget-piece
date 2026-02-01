'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function getUserEvents() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'Not authenticated', events: [] };
    }

    const events = await prisma.event.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        scenarios: {
          where: { isPrimary: true },
          select: { totalBudgetCents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        weddingDate: event.weddingDate,
        timezone: event.timezone,
        status: event.status,
        totalBudgetCents: event.scenarios[0]?.totalBudgetCents || 0,
        role: event.members[0]?.role || 'GUEST',
        createdAt: event.createdAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
      events: [],
    };
  }
}
