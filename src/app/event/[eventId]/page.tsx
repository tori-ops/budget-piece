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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-600">Wedding Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(event.weddingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Timezone</p>
                <p className="text-lg text-gray-900">{event.timezone}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Status</p>
                <p className="text-lg text-gray-900 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Your Role</p>
                <p className="text-lg text-gray-900">{member.role}</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-300 rounded-lg mb-8">
              <p className="text-sm text-blue-900">
                <strong>Event ID:</strong> {eventId}
              </p>
              <p className="text-xs text-blue-800 mt-2">
                This is a placeholder. Routing logic will direct you to the intro or setup wizard next.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="/events/new"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                ← Back to Create Event
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading event:', error);
    redirect('/');
  }
}
