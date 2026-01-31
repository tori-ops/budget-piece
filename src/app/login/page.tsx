import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle cookie errors
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Wedding Budget Tool</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center mb-6">
            Login with your Supabase account to continue.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              <strong>Setup Required:</strong> Configure Supabase Auth in your project settings to enable login.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
            <p className="text-xs text-yellow-800">
              <strong>Placeholder:</strong> Replace this with your preferred auth UI (Supabase Auth UI or custom form).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
