import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
import Provider from './provider';
import { Toaster } from 'sonner';
import FooterWrapper from '@/components/layout/FooterWrapper';

const inter = Inter({ subsets: ['latin'] });



export const metadata: Metadata = {
  title: 'SwipeIt - AI-Powered Recruitment',
  description: 'Match with the perfect job or candidate using AI-powered semantic matching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Header />
              
              <main className="flex-1">{children}</main>
              <FooterWrapper />
            </div>
            <Toaster />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}