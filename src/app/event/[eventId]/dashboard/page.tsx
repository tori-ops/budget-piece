import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getEventDashboardData } from '@/app/actions/getDashboardData';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';

interface DashboardPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
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

    // Get dashboard data
    const result = await getEventDashboardData(eventId);

    if (!result.success || !result.data) {
      redirect('/');
    }

    return <EnhancedDashboard data={result.data} />;
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/');
  }
}
