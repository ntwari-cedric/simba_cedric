import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, products as initialProducts } from '../data/mockData';

export interface MergedProduct extends Product {
  stock: number;
}

interface ProductOverrides {
  [id: string]: {
    price?: number;
    stock?: number;
  };
}

interface ProductContextType {
  products: MergedProduct[];
  updateProduct: (id: string, updates: { price?: number; stock?: number }) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<ProductOverrides>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'product_overrides'), (snapshot) => {
      const data: ProductOverrides = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setOverrides(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading product overrides:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const mergedProducts = initialProducts.map(p => ({
    ...p,
    price: overrides[p.id]?.price ?? p.price,
    stock: overrides[p.id]?.stock ?? 100
  }));

  const updateProduct = async (id: string, updates: { price?: number; stock?: number }) => {
    // Optimistic update
    setOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
    
    try {
      await setDoc(doc(db, 'product_overrides', id), updates, { merge: true });
    } catch (err) {
      console.error("Failed to update product:", err);
      // Let onSnapshot correct the state if it fails eventually
    }
  };

  return (
    <ProductContext.Provider value={{ products: mergedProducts, updateProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
