import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface DashboardPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { eventId } = await params;

  try {
    const userId = await getCurrentUserId();

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

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      redirect('/');
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#D0CEB5' }}>
        {/* Header */}
        <header className="py-8 px-4 text-center border-b" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#274E13' }}>
            The Budget Piece
          </h1>
          <p className="text-sm" style={{ color: '#274E13' }}>
            a planning tool by The Missing Piece Planning and Events, LLC
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#274E13' }}>
                {event.title}
              </h2>
              
              <div className="h-1 w-16 mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F1F1' }}>
                  <p className="text-sm font-semibold" style={{ color: '#274E13' }}>Wedding Date</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: '#274E13' }}>
                    {new Date(event.weddingDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F1F1' }}>
                  <p className="text-sm font-semibold" style={{ color: '#274E13' }}>Timezone</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: '#274E13' }}>
                    {event.timezone}
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F1F1' }}>
                  <p className="text-sm font-semibold" style={{ color: '#274E13' }}>Your Role</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: '#274E13' }}>
                    {member.role.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-lg text-center" style={{ backgroundColor: '#E8F5E9', borderLeft: '4px solid #274E13' }}>
                <p className="text-lg font-semibold" style={{ color: '#274E13' }}>
                  🎉 Dashboard is coming soon!
                </p>
                <p className="mt-2" style={{ color: '#274E13' }}>
                  Here you'll see your budget overview, allocations, and spending summaries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 px-4 text-center border-t" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
          <p className="text-sm" style={{ color: '#274E13' }}>
            The Missing Piece Planning and Events, LLC
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/');
  }
}
