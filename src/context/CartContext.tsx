import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Book, CartItem } from "@/types/book";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  wishlist: Book[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (book: Book) => void;
  isInWishlist: (bookId: string) => boolean;
  totalItems: number;
  totalPrice: number;
  loadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Map DB book row to Book type
  const mapBook = (b: any): Book => ({
    id: b.id, title: b.title, author: b.author, category: b.category,
    price: b.price, originalPrice: b.original_price ?? undefined, stock: b.stock,
    image: b.image ?? "", description: b.description ?? "",
    rating: Number(b.rating) || 0, reviewCount: b.review_count ?? 0,
    featured: b.featured ?? false, bestseller: b.bestseller ?? false,
    language: b.language ?? "English",
  });

  // Load cart from DB
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setItems([]);
      setWishlist([]);
      setLoadingCart(false);
      return;
    }
    setLoadingCart(true);
    
    const loadData = async () => {
      const [cartRes, wishRes] = await Promise.all([
        supabase.from("cart_items").select("*, books(*)").eq("user_id", user.id),
        supabase.from("wishlist_items").select("*, books(*)").eq("user_id", user.id),
      ]);
      
      if (cartRes.data) {
        setItems(cartRes.data.map((ci: any) => ({ book: mapBook(ci.books), quantity: ci.quantity })));
      }
      if (wishRes.data) {
        setWishlist(wishRes.data.map((wi: any) => mapBook(wi.books)));
      }
      setLoadingCart(false);
    };
    loadData();
  }, [user, authLoading]);

  const addToCart = useCallback(async (book: Book, quantity = 1) => {
    if (!user) { toast.error("Please login to add items to cart"); return; }
    
    const existing = items.find(i => i.book.id === book.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      await supabase.from("cart_items").update({ quantity: newQty }).eq("user_id", user.id).eq("book_id", book.id);
      setItems(prev => prev.map(i => i.book.id === book.id ? { ...i, quantity: newQty } : i));
      toast.success(`Updated "${book.title}" quantity in cart`);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, book_id: book.id, quantity });
      setItems(prev => [...prev, { book, quantity }]);
      toast.success(`Added "${book.title}" to cart`);
    }
  }, [user, items]);

  const removeFromCart = useCallback(async (bookId: string) => {
    if (!user) return;
    const item = items.find(i => i.book.id === bookId);
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("book_id", bookId);
    setItems(prev => prev.filter(i => i.book.id !== bookId));
    if (item) toast.info(`Removed "${item.book.title}" from cart`);
  }, [user, items]);

  const updateQuantity = useCallback(async (bookId: string, quantity: number) => {
    if (quantity < 1 || !user) return;
    await supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("book_id", bookId);
    setItems(prev => prev.map(i => i.book.id === bookId ? { ...i, quantity } : i));
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
    toast.info("Cart cleared");
  }, [user]);

  const toggleWishlist = useCallback(async (book: Book) => {
    if (!user) { toast.error("Please login to use wishlist"); return; }
    
    const exists = wishlist.find(b => b.id === book.id);
    if (exists) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("book_id", book.id);
      setWishlist(prev => prev.filter(b => b.id !== book.id));
      toast.info(`Removed "${book.title}" from wishlist`);
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, book_id: book.id });
      setWishlist(prev => [...prev, book]);
      toast.success(`Added "${book.title}" to wishlist`);
    }
  }, [user, wishlist]);

  const isInWishlist = useCallback((bookId: string) => wishlist.some(b => b.id === bookId), [wishlist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist, totalItems, totalPrice, loadingCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
