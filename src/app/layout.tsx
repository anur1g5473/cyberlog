import type { Metadata, Viewport } from 'next';
import { Fira_Code, Inter } from 'next/font/google';
import './globals.css';
import { ClientLayoutWrapper } from '@/components/providers/ClientLayoutWrapper';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CyberLog ❯ Security Research & Portfolio',
  description: 'Personal portfolio and research log documenting web security, network pentesting, auth engineering, and tools.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${firaCode.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col justify-between antialiased selection:bg-terminal-green/30 selection:text-terminal-green">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}

