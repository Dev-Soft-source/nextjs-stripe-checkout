import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import Image from 'next/image';
import Head from 'next/head';
import { formatCurrency } from '@/lib/utils';
import { MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline';
import { isLocale, supportedLanguageList } from '@/i18n/settings';

import products from 'products';
import type { Product } from 'products';

const Product = (props: Product) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { cartCount, addItem } = useShoppingCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const toastId = useRef<string | undefined>(undefined);
  const firstRun = useRef(true);

  const handleOnAddToCart = () => {
    setAdding(true);
    toastId.current = toast.loading(
      t('product.addingToast', { count: qty })
    );
    addItem(props, qty);
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setAdding(false);
    toast.success(t('product.addedToast', { qty, name: props.name }), {
      id: toastId.current,
    });
    setQty(1);
  }, [cartCount]);

  return router.isFallback ? (
    <>
      <Head>
        <title>{t('product.loading')}</title>
      </Head>
      <p className="text-center text-lg py-12">{t('product.loading')}</p>
    </>
  ) : (
    <>
      <Head>
        <title>{props.name} | AlterClass</title>
      </Head>
      <div className="container lg:max-w-screen-lg mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-12">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96">
            <Image
              src={props.image}
              alt={props.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 288px, 384px"
            />
          </div>

          <div className="flex-1 max-w-md border border-opacity-50 rounded-md shadow-lg p-6">
            <h2 className="text-3xl font-semibold">{props.name}</h2>
            <p>
              <span className="text-gray-500">{t('product.availability')}</span>{' '}
              <span className="font-semibold">{t('product.inStock')}</span>
            </p>

            <div className="mt-8 border-t pt-4">
              <p className="text-gray-500">{t('product.price')}</p>
              <p className="text-xl font-semibold">
                {formatCurrency(props.price)}
              </p>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-gray-500">{t('product.quantity')}</p>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  onClick={() => setQty(prev => prev - 1)}
                  disabled={qty <= 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current hover:bg-rose-100 hover:text-rose-500 rounded-md p-1"
                >
                  <MinusSmIcon className="w-6 h-6 flex-shrink-0" />
                </button>
                <p className="font-semibold text-xl">{qty}</p>
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  className="hover:bg-green-100 hover:text-green-500 rounded-md p-1"
                >
                  <PlusSmIcon className="w-6 h-6 flex-shrink-0 " />
                </button>
              </div>

              <button
                type="button"
                onClick={handleOnAddToCart}
                disabled={adding}
                className="mt-8 border rounded py-2 px-6 bg-rose-500 hover:bg-rose-600 border-rose-500 hover:border-rose-600 focus:ring-4 focus:ring-opacity-50 focus:ring-rose-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('product.addToCart', { qty })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: supportedLanguageList.flatMap(lng =>
    products.map(product => ({
      params: { lng, id: product.id },
    }))
  ),
  fallback: true,
});

export const getStaticProps: GetStaticProps<Product> = async ({ params }) => {
  const lng = params?.lng;
  const id = params?.id;

  if (
    typeof lng !== 'string' ||
    !isLocale(lng) ||
    typeof id !== 'string'
  ) {
    return { notFound: true };
  }

  const props = products.find(product => product.id === id);
  if (!props) {
    return { notFound: true };
  }

  return {
    props,
    revalidate: 1,
  };
};

export default Product;
