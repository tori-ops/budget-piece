import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  try {
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
  } catch (error) {
    // Silently handle auth errors - allow page to render
    console.error('Auth check failed:', error);
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
        <p className="text-xs mt-2 opacity-70" style={{ color: '#274E13' }}>
          copyright 2026 version 1.1.1
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#274E13' }}>
            Welcome
          </h2>
          
          <div className="h-1 w-16 mx-auto mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

          <div className="space-y-6">
            <p className="text-center" style={{ color: '#274E13' }}>
              Log in to start planning your budget
            </p>

            <div className="rounded-lg p-4" style={{ backgroundColor: '#D0CEB5' }}>
              <p className="text-sm" style={{ color: '#274E13' }}>
                <strong>Authentication Setup:</strong> Login functionality will be available soon. For now, you can explore the event creation flow.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#274E13',
                  color: '#D0CEB5',
                }}
              >
                Login with Email
              </button>

              <button
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 hover:bg-opacity-20 hover:bg-green-900"
                style={{ 
                  borderColor: '#274E13',
                  color: '#274E13',
                  backgroundColor: 'transparent'
                }}
              >
                Sign Up
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
}
