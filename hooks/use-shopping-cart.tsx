import React, {
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { Product } from 'products';
import useLocalStorageReducer from './use-local-storage-reducer';

export type CartEntry = Product & { quantity: number };

export type CartState = {
  cartDetails: Record<string, CartEntry>;
  cartCount: number;
  totalPrice: number;
};

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; product: Product; quantity: number }
  | { type: 'CLEAR_CART' };

const initialCartValues: CartState = {
  cartDetails: {},
  cartCount: 0,
  totalPrice: 0,
};

const addItem = (
  state: CartState = initialCartValues,
  product: Product | null = null,
  quantity = 0
): CartState => {
  if (quantity <= 0 || !product) return state;

  let entry = state.cartDetails[product.id];

  if (entry) {
    entry = { ...entry, quantity: entry.quantity + quantity };
  } else {
    entry = {
      ...product,
      quantity,
    };
  }

  return {
    ...state,
    cartDetails: {
      ...state.cartDetails,
      [product.id]: entry,
    },
    cartCount: Math.max(0, state.cartCount + quantity),
    totalPrice: Math.max(0, state.totalPrice + product.price * quantity),
  };
};

const removeItem = (
  state: CartState = initialCartValues,
  product: Product | null = null,
  quantity = 0
): CartState => {
  if (quantity <= 0 || !product) return state;

  const entry = state.cartDetails[product.id];

  if (entry) {
    if (quantity >= entry.quantity) {
      const { [product.id]: _removed, ...details } = state.cartDetails;
      return {
        ...state,
        cartDetails: details,
        cartCount: Math.max(0, state.cartCount - entry.quantity),
        totalPrice: Math.max(
          0,
          state.totalPrice - product.price * entry.quantity
        ),
      };
    }

    return {
      ...state,
      cartDetails: {
        ...state.cartDetails,
        [product.id]: {
          ...entry,
          quantity: entry.quantity - quantity,
        },
      },
      cartCount: Math.max(0, state.cartCount - quantity),
      totalPrice: Math.max(0, state.totalPrice - product.price * quantity),
    };
  }

  return state;
};

const clearCart = (): CartState => initialCartValues;

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return addItem(state, action.product, action.quantity);
    case 'REMOVE_ITEM':
      return removeItem(state, action.product, action.quantity);
    case 'CLEAR_CART':
      return clearCart();
    default:
      return state;
  }
};

type CartContextValue = [
  CartState & { currency: string },
  Dispatch<CartAction>,
];

const CartContext = React.createContext<CartContextValue | undefined>(
  undefined
);

export const CartProvider = ({
  currency = 'USD',
  children = null,
}: {
  currency?: string;
  children?: ReactNode;
}) => {
  const [cart, dispatch] = useLocalStorageReducer(
    'cart',
    cartReducer,
    initialCartValues
  );

  const contextValue = useMemo(
    (): CartContextValue => [
      {
        ...cart,
        currency,
      },
      dispatch,
    ],
    [cart, currency]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useShoppingCart must be used within a CartProvider');
  }

  const [cart, dispatch] = ctx;

  const addItem = (product: Product, quantity = 1) =>
    dispatch({ type: 'ADD_ITEM', product, quantity });

  const removeItem = (product: Product, quantity = 1) =>
    dispatch({ type: 'REMOVE_ITEM', product, quantity });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return {
    ...cart,
    addItem,
    removeItem,
    clearCart,
  };
};
