import './globals.css';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata = {
  title: 'YourBeautyOurPriority',
  description: 'Salon management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
