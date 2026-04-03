import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { fetcher, shootFireworks } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/outline';

const Success = () => {
  const { t } = useTranslation();
  const {
    query: { session_id },
  } = useRouter();

  const { clearCart } = useShoppingCart();

  const sessionId =
    typeof session_id === 'string' ? session_id : undefined;

  const { data, error } = useSWR(
    sessionId ? `/api/checkout_sessions/${sessionId}` : null,
    fetcher
  );

  useEffect(() => {
    if (data) {
      shootFireworks();
      clearCart();
    }
  }, [data, clearCart]);

  return (
    <>
      <Head>
        <title>{t('meta.successTitle')}</title>
      </Head>
      <div className="container xl:max-w-screen-xl mx-auto py-12 px-6 text-center">
        {error ? (
          <div className="p-2 rounded-md bg-rose-100 text-rose-500 max-w-md mx-auto">
            <p className="text-lg">{t('success.error')}</p>
          </div>
        ) : !data ? (
          <div className="p-2 rounded-md bg-gray-100 text-gray-500 max-w-md mx-auto">
            <p className="text-lg animate-pulse">{t('success.loading')}</p>
          </div>
        ) : (
          <div className="py-4 px-8 rounded-md bg-gray-100 max-w-lg mx-auto">
            <h2 className="text-4xl font-semibold flex flex-col items-center space-x-1">
              <CheckIcon className="w-12 h-12 flex-shrink-0 text-green-600" />
              <span>{t('success.thanks')}</span>
            </h2>
            <p className="text-lg mt-3">{t('success.receipt')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Success;
