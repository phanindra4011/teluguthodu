import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { Logo } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Telugu Thodu',
  description: 'An AI-powered learning assistant for Telugu students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-20 border-b bg-background">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <Logo size={28} />
            </div>
          </header>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
