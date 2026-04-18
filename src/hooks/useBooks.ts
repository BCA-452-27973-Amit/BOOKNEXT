import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { books as localBooks } from "@/data/books";
import { Book } from "@/types/book";

// Helper to map Supabase row to Book type
const mapSupabaseBook = (b: any): Book => ({
  id: b.id,
  title: b.title,
  author: b.author,
  category: b.category,
  price: b.price,
  originalPrice: b.original_price ?? undefined,
  stock: b.stock,
  image: b.image ?? "",
  description: b.description ?? "",
  rating: Number(b.rating) || 0,
  reviewCount: b.review_count ?? 0,
  featured: b.featured ?? false,
  bestseller: b.bestseller ?? false,
  language: b.language ?? "English",
});

export const useBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<Book[]> => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase books fetch failed, using local data:", error.message);
          return localBooks;
        }

        // If Supabase returns data, use it; otherwise fall back to local
        if (data && data.length > 0) {
          return data.map(mapSupabaseBook);
        }

        return localBooks;
      } catch (err) {
        console.warn("Supabase query failed, using local books data:", err);
        return localBooks;
      }
    },
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: ["book", id],
    queryFn: async (): Promise<Book | null> => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.warn("Supabase book fetch failed, using local data:", error.message);
          return localBooks.find((b) => b.id === id) || null;
        }

        if (data) {
          return mapSupabaseBook(data);
        }

        // If no data from Supabase, try local
        return localBooks.find((b) => b.id === id) || null;
      } catch (err) {
        console.warn("Supabase query failed, using local book data:", err);
        return localBooks.find((b) => b.id === id) || null;
      }
    },
    enabled: !!id,
  });
};
