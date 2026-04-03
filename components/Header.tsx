import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { useLocale } from '@/hooks/use-locale';
import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/index';
import { ShoppingCartIcon } from '@heroicons/react/solid';
import { languages } from '@/i18n/settings';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { prefix, lng, pathForLocale } = useLocale();
  const { totalPrice, cartCount } = useShoppingCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 bg-white z-10 shadow">
      <div className="container xl:max-w-screen-xl mx-auto p-6 flex justify-between items-center gap-4">
        <Logo />
        <nav
          className="flex items-center gap-1 text-sm"
          aria-label={t('nav.language')}
        >
          {languages.map((code, i) => (
            <span key={code} className="flex items-center gap-1">
              {i > 0 ? (
                <span className="text-gray-300 select-none" aria-hidden>
                  |
                </span>
              ) : null}
              {lng === code ? (
                <span className="font-semibold text-gray-900" aria-current="true">
                  {code.toUpperCase()}
                </span>
              ) : (
                <Link
                  href={pathForLocale(code)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  {code.toUpperCase()}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <Link
          href={`${prefix}/cart`}
          className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
        >
          <div className="relative">
            <ShoppingCartIcon className="w-7 h-7 flex-shrink-0" />
          </div>
          <p className="text-lg">
            {formatCurrency(isMounted ? totalPrice : 0)}{' '}
            <span className="text-sm text-gray-500">
              ({isMounted ? cartCount : 0})
            </span>
          </p>
        </Link>
      </div>
    </header>
  );
};

export default Header;
