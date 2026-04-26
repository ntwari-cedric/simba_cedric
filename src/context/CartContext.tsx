import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../data/mockData';
import { useProducts, MergedProduct } from './ProductContext';

export interface CartItem extends MergedProduct {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<{ id: string; quantity: number }[]>([]);
  const { products } = useProducts();

  const items: CartItem[] = cartState.map(cartItem => {
    const p = products.find(prod => prod.id === cartItem.id);
    return p ? { ...p, quantity: cartItem.quantity } : null;
  }).filter(Boolean) as CartItem[];

  const addItem = (product: Product, quantity: number = 1) => {
    setCartState((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: product.id, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setCartState((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartState((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartState([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
