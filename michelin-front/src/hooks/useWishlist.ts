import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { List, ListWithItems } from "@/types/database";

export function useWishlist(userId: string | null) {
  return useQuery<ListWithItems[]>({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select(`
          *,
          list_items(
            *,
            restaurant:restaurants(*)
          )
        `)
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ListWithItems[];
    },
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; is_public?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("lists")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as List;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["wishlist", data.user_id] });
    },
  });
}

export function useAddToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      list_id,
      restaurant_id,
    }: {
      list_id: string;
      restaurant_id: string;
    }) => {
      const { data, error } = await supabase
        .from("list_items")
        .insert({ list_id, restaurant_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveFromList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      list_id,
      restaurant_id,
    }: {
      list_id: string;
      restaurant_id: string;
    }) => {
      const { error } = await supabase
        .from("list_items")
        .delete()
        .eq("list_id", list_id)
        .eq("restaurant_id", restaurant_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
