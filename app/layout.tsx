import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen pb-24"> {/* Add padding-bottom so content isn't hidden behind the dock */}
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
