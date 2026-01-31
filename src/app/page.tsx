import Link from 'next/link';

export default function Home() {
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
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#274E13' }}>
            Welcome to The Budget Piece
          </h2>
          
          <div className="h-1 w-16 mx-auto mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

          <div className="space-y-6">
            <p className="text-center" style={{ color: '#274E13' }}>
              Your wedding budget planning tool
            </p>

            <div className="space-y-3">
              <Link href="/events/new" className="block w-full py-3 px-4 rounded-lg font-medium text-center transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#274E13',
                  color: '#D0CEB5',
                }}>
                Create New Event
              </Link>

              <Link href="/login" className="block w-full py-3 px-4 rounded-lg font-medium text-center transition-all duration-200 border-2"
                style={{ 
                  borderColor: '#274E13',
                  color: '#274E13',
                  backgroundColor: 'transparent'
                }}>
                Login
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
}
