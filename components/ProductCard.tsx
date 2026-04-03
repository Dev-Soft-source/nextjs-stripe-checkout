import { useState, useEffect, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { useLocale } from '@/hooks/use-locale';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Rating from './Rating';
import type { Product } from 'products';

type ProductCardProps = Product & {
  disabled?: boolean;
  onClickAdd?: () => void;
  onAddEnded?: () => void;
};

const ProductCard = (props: ProductCardProps) => {
  const { t } = useTranslation();
  const { prefix } = useLocale();
  const { cartCount, addItem } = useShoppingCart();
  const [adding, setAdding] = useState(false);

  const toastId = useRef<string | undefined>(undefined);
  const firstRun = useRef(true);

  const handleOnAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setAdding(true);
    toastId.current = toast.loading(t('productCard.addingOne'));

    props.onClickAdd?.();

    addItem(props);
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (adding) {
      setAdding(false);
      toast.success(t('productCard.added', { name: props.name }), {
        id: toastId.current,
      });
    }

    props.onAddEnded?.();
  }, [cartCount]);

  return (
    <Link
      href={`${prefix}/products/${props.id}`}
      className="border rounded-md p-6 group"
    >
      <div className="relative w-full h-64 group-hover:transform group-hover:scale-125 group-hover:ease-in-out group-hover:duration-500">
        <Image
          src={props.image}
          alt={props.name}
          fill
          className="object-contain"
          sizes="(max-width: 1280px) 50vw, 320px"
        />
      </div>

      <div className="mt-4 sm:mt-8">
        <p className="font-semibold text-lg capitalize">{props.name}</p>
        <Rating rate={props?.rating?.rate} count={props?.rating?.count} />
      </div>

      <div className="mt-4 flex items-center justify-between space-x-2">
        <div>
          <p className="text-gray-500">{t('productCard.price')}</p>
          <p className="text-lg font-semibold">
            {formatCurrency(props.price, props.currency)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOnAddToCart}
          disabled={adding || props.disabled}
          className={`border rounded-lg py-1 px-4 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            adding
              ? 'disabled:bg-rose-500 disabled:border-rose-500 disabled:text-white'
              : 'disabled:hover:bg-transparent disabled:hover:text-current disabled:hover:border-gray-200'
          }`}
        >
          {adding ? t('productCard.adding') : t('productCard.addToCart')}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
