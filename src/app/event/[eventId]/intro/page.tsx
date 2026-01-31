import Link from 'next/link';
import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface IntroPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function IntroPage({ params }: IntroPageProps) {
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
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#274E13' }}>
              Welcome to {event.title}
            </h2>
            
            <div className="h-1 w-16 mx-auto mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

            <div className="space-y-6">
              <p className="text-lg text-center" style={{ color: '#274E13' }}>
                This is where we'll guide you through creating your budget for your special day.
              </p>

              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded" style={{ backgroundColor: '#E8F5E9' }}>
                <p className="font-semibold" style={{ color: '#274E13' }}>
                  Wedding Date: {new Date(event.weddingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="mt-2" style={{ color: '#274E13' }}>
                  Timezone: {event.timezone}
                </p>
              </div>

              <div className="space-y-4">
                <p style={{ color: '#274E13' }}>
                  We'll help you:
                </p>
                <ul className="space-y-2 pl-4">
                  <li style={{ color: '#274E13' }} className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Define your wedding style and preferences</span>
                  </li>
                  <li style={{ color: '#274E13' }} className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Allocate your budget across categories</span>
                  </li>
                  <li style={{ color: '#274E13' }} className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Track spending and adjustments</span>
                  </li>
                  <li style={{ color: '#274E13' }} className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Collaborate with your team</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 space-y-3">
                <Link
                  href={`/event/${eventId}/setup/type`}
                  className="block w-full py-4 px-4 rounded-lg font-medium text-center transition-all duration-200"
                  style={{ 
                    backgroundColor: '#274E13',
                    color: '#D0CEB5',
                  }}
                >
                  Start Budget Setup
                </Link>

                <button
                  className="w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 border-2"
                  style={{ 
                    borderColor: '#274E13',
                    color: '#274E13',
                    backgroundColor: 'transparent'
                  }}
                  onClick={async () => {
                    // This will be handled by a server action later
                    window.location.href = `/event/${eventId}/setup/type`;
                  }}
                >
                  Skip for Now
                </button>
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
    console.error('Intro page error:', error);
    redirect('/');
  }
}
