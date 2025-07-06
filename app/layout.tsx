import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: 'TaskMaster - Focus & Productivity',
  description: 'A modern Pomodoro timer and task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-base-0 dark:bg-dark-base-0 font-sans text-text dark:text-dark-text antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}