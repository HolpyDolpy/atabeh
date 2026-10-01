import './globals.css';
import Header from '../components/Header';
import WhatsAppOrderButton from '../components/WhatsAppOrderButton';
import Footer from '../components/Footer';
import GlobalUX from '../components/GlobalUX';

export const metadata = {
  title: 'Atabeh Royal Carpet',
  description: 'Premium carpets, rugs, handmade pieces and flooring.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <GlobalUX />
        <Header />
        {children}
        <Footer />
        <WhatsAppOrderButton />
      </body>
    </html>
  );
}
