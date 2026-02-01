import Link from 'next/link';
import { getUserEvents } from '@/app/actions/getEvents';
import { Dashboard } from '@/components/Dashboard';

export default async function Home() {
  const result = await getUserEvents();

  return (
    <Dashboard events={result.success ? result.events : []} />
  );
}
