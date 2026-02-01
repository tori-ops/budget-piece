import Link from 'next/link';
import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface SetupTypePageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function SetupTypePage({ params }: SetupTypePageProps) {
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

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      redirect('/');
    }

    const weddingTypes = [
      { id: 'intimate', name: 'Intimate', description: 'Under 50 guests' },
      { id: 'small', name: 'Small', description: '50-100 guests' },
      { id: 'medium', name: 'Medium', description: '100-200 guests' },
      { id: 'large', name: 'Large', description: '200-350 guests' },
      { id: 'grand', name: 'Grand', description: '350+ guests' },
      { id: 'destination', name: 'Destination', description: 'Travel wedding' },
    ];

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
          <div className="max-w-2xl w-full">
            <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
              <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#274E13' }}>
                Tell us about your wedding
              </h2>
              
              <div className="h-1 w-16 mx-auto mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

              <p className="text-center mb-8" style={{ color: '#274E13' }}>
                Select your wedding style to help us suggest budget categories
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {weddingTypes.map((type) => (
                  <button
                    key={type.id}
                    className="p-4 rounded-lg border-2 transition-all duration-200"
                    style={{ 
                      borderColor: '#274E13',
                      color: '#274E13',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#D0CEB5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <p className="font-semibold">{type.name}</p>
                    <p className="text-sm">{type.description}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/event/${eventId}/setup/categories`}
                  className="block w-full py-3 px-4 rounded-lg font-medium text-center transition-all duration-200"
                  style={{ 
                    backgroundColor: '#274E13',
                    color: '#D0CEB5',
                  }}
                >
                  Continue to Dashboard
                </Link>
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
    console.error('Setup type page error:', error);
    redirect('/');
  }
}
