import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart ToDoList — AI-приоритезация задач (Gemini)',
  description: 'Умный планировщик задач с автоматической приоритезацией, матрицей Эйзенхауэра и декомпозицией через Google Gemini AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
