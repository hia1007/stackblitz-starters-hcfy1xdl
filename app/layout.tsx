import './globals.css';
import SessionProviders from './providers/SessionProviderClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen pb-24"> {/* Add padding-bottom so content isn't hidden behind the dock */}
        <SessionProviders>
          <main className="p-4">
            {children}
          </main>
        </SessionProviders>
      </body>
    </html>
  );
}
