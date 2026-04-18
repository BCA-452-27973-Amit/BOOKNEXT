import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface ReviewData {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

export const useReviews = (bookId: string) => {
  return useQuery({
    queryKey: ["reviews", bookId],
    queryFn: async (): Promise<ReviewData[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!bookId,
  });
};

export const useAddReview = (bookId: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("reviews").insert({
        book_id: bookId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email || "Anonymous",
        rating,
        comment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      toast.success("Review submitted!");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
