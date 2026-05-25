import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OlyLife P90+ Bot',
  description: 'ผู้ช่วยอัจฉริยะ OlyLife THZ Tera-P90+',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#070e1a', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
