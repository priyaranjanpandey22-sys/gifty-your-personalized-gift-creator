import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/lib/products";

export type CartItem = {
  id: string;
  slug: string;
  qty: number;
  customText?: string;
  font?: string;
  photoName?: string;
  photoDataUrl?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  productFor: (slug: string) => Product | undefined;
};

const STORAGE_KEY = "gdgifts.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupted cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [
      ...prev,
      { ...item, id: `${item.slug}-${Date.now()}-${prev.length}` },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(50, Math.max(1, qty)) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const productFor = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.slug === item.slug);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal,
      add,
      remove,
      setQty,
      clear,
      productFor,
    };
  }, [items, add, remove, setQty, clear, productFor]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
