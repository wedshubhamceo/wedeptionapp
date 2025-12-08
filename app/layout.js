import '../wedeption-ui-kit/theme.css'
import '../styles/globals.css';
import SiteHeader from '../components/SiteHeader';

export const metadata = { 
  title: 'Wedeption - Plan Your Dream Wedding',
  description: 'Discover premium wedding vendors, get AI-powered planning, and create unforgettable memories. Your trusted partner in planning the perfect wedding.',
  keywords: 'wedding planning, wedding vendors, wedding inspiration, wedding decor, wedding photography',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body>
        <SiteHeader />
        <main style={{ minHeight: 'calc(100vh - 73px)' }}>{children}</main>
      </body>
    </html>
  );
}
