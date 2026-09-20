import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OlyLife P90+ Bot',
  description: 'ผู้ช่วยข้อมูล OlyLife THZ Tera-P90+ เทคโนโลยี PEMF & Terahertz',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'P90+ Bot',
  },
  openGraph: {
    title: 'OlyLife P90+ Bot',
    description: 'ผู้ช่วยข้อมูล OlyLife THZ Tera-P90+',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d7377',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin:0, padding:0, background:'#070e1a', fontFamily:"'Sarabun','Noto Sans Thai',sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
