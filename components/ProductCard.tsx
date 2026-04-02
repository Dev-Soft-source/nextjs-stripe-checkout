import { useState, useEffect, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { formatCurrency } from '@/lib/utils';
import Rating from './Rating';
import type { Product } from 'products';

type ProductCardProps = Product & {
  disabled?: boolean;
  onClickAdd?: () => void;
  onAddEnded?: () => void;
};

const ProductCard = (props: ProductCardProps) => {
  const { cartCount, addItem } = useShoppingCart();
  const [adding, setAdding] = useState(false);

  const toastId = useRef<string | undefined>(undefined);
  const firstRun = useRef(true);

  const handleOnAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setAdding(true);
    toastId.current = toast.loading('Adding 1 item...');

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
      toast.success(`${props.name} added`, {
        id: toastId.current,
      });
    }

    props.onAddEnded?.();
  }, [cartCount]);

  return (
    <Link
      href={`/products/${props.id}`}
      className="border rounded-md p-6 group"
    >
      <div className="relative w-full h-64 group-hover:transform group-hover:scale-125 group-hover:ease-in-out group-hover:duration-500">
        <Image
          src={props.image}
          alt={props.name}
          layout="fill"
          objectFit="contain"
        />
      </div>

      <div className="mt-4 sm:mt-8">
        <p className="font-semibold text-lg capitalize">{props.name}</p>
        <Rating rate={props?.rating?.rate} count={props?.rating?.count} />
      </div>

      <div className="mt-4 flex items-center justify-between space-x-2">
        <div>
          <p className="text-gray-500">Price</p>
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
          {adding ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
