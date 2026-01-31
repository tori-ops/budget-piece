'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface CreateEventInput {
  title: string;
  weddingDate: string; // ISO string: YYYY-MM-DD
  timezone: string;
  totalBudgetCents: number;
}

export interface CreateEventResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

/**
 * Create a new wedding event with all related records
 */
export async function createEvent(input: CreateEventInput): Promise<CreateEventResult> {
  try {
    // Authenticate user
    const userId = await getCurrentUserId();

    // Validate input
    const { title, weddingDate, timezone, totalBudgetCents } = input;

    // Title validation
    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }
    if (title.trim().length > 120) {
      return { success: false, error: 'Title must be 120 characters or less' };
    }

    // Wedding date validation
    if (!weddingDate) {
      return { success: false, error: 'Wedding date is required' };
    }
    const weddingDateObj = new Date(weddingDate);
    if (isNaN(weddingDateObj.getTime())) {
      return { success: false, error: 'Invalid wedding date' };
    }

    // Timezone validation (basic: must contain "/" or be "UTC")
    if (!timezone) {
      return { success: false, error: 'Timezone is required' };
    }
    if (timezone !== 'UTC' && !timezone.includes('/')) {
      return { success: false, error: 'Invalid timezone format (e.g., America/New_York or UTC)' };
    }

    // Total budget validation
    if (!totalBudgetCents || totalBudgetCents <= 0) {
      return { success: false, error: 'Total budget must be greater than 0' };
    }
    if (totalBudgetCents > 100000000) {
      // Cap at $1,000,000
      return { success: false, error: 'Total budget cannot exceed $1,000,000' };
    }

    // Calculate purgeReceiptsAt (6 months after wedding date)
    const purgeDate = new Date(weddingDateObj);
    purgeDate.setMonth(purgeDate.getMonth() + 6);

    // Create all records in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = await prisma.$transaction(async (tx: any) => {
      // 1. Create Event
      const newEvent = await tx.event.create({
        data: {
          title: title.trim(),
          weddingDate: weddingDateObj,
          timezone,
          status: 'ACTIVE',
          purgeReceiptsAt: purgeDate,
          createdByUserId: userId,
        },
      });

      // 2. Create EventMember (creator as COUPLE_OWNER)
      await tx.eventMember.create({
        data: {
          eventId: newEvent.id,
          userId,
          role: 'COUPLE_OWNER',
        },
      });

      // 3. Create UserEventState (hasSeenIntro=false)
      await tx.userEventState.create({
        data: {
          eventId: newEvent.id,
          userId,
          hasSeenIntro: false,
          seenIntroAt: null,
        },
      });

      // 4. Create primary BudgetScenario
      await tx.budgetScenario.create({
        data: {
          eventId: newEvent.id,
          name: 'Baseline',
          isPrimary: true,
          currency: 'USD',
          totalBudgetCents,
          inputs: {},
        },
      });

      return newEvent;
    });

    // Redirect to event page
    redirect(`/event/${event.id}`);
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    };
  }
}
