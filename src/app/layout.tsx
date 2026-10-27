import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Smart ToDoList — Спокойный фокус на главном',
  description: 'Умный планировщик задач в стиле Nordic Sanctuary с автоматической декомпозицией и матрицей Эйзенхауэра',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`dark ${plusJakartaSans.variable}`} suppressHydrationWarning style={{ backgroundColor: '#111211' }}>
      <body className="min-h-screen antialiased bg-[#111211] text-[#E1E3DA] font-sans selection:bg-[#7E9F74]/25 selection:text-[#E1E3DA]">
        {children}
      </body>
    </html>
  );
}
