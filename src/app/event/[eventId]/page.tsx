import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      redirect('/login');
    }

    // Verify user is member of this event
    const member = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!member) {
      redirect('/');
    }

    // Get user event state to check if they've seen intro
    const userEventState = await prisma.userEventState.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Check if they've seen the intro
    if (!userEventState?.hasSeenIntro) {
      redirect(`/event/${eventId}/intro`);
    }

    // Check if event has any allocations (budget scenarios with allocations)
    const allocations = await prisma.categoryAllocation.findFirst({
      where: {
        scenario: {
          eventId,
        },
      },
    });

    // If no allocations exist, send to setup
    if (!allocations) {
      redirect(`/event/${eventId}/setup/type`);
    }

    // Otherwise, show dashboard
    redirect(`/event/${eventId}/dashboard`);
  } catch (error) {
    console.error('Event page error:', error);
    redirect('/');
  }
}
