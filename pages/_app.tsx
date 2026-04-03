import 'tailwindcss/tailwind.css';
import type { AppProps } from 'next/app';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/i18n/i18next';
import { CartProvider } from '@/hooks/use-shopping-cart';
import { Header, Footer } from '@/components/index';
import { DefaultMeta } from '@/components/DefaultMeta';
import { I18nLocaleSync } from '@/components/I18nLocaleSync';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nLocaleSync />
      <DefaultMeta />
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </CartProvider>
      <Toaster />
    </I18nextProvider>
  );
}

export default MyApp;
