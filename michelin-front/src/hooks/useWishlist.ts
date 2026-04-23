import { useMemo } from "react";
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
            establishment:establishments(*)
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
      establishment_id,
    }: {
      list_id: string;
      establishment_id: string;
    }) => {
      const { data, error } = await supabase
        .from("list_items")
        .insert({ list_id, establishment_id })
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

export function useSavedIds(userId: string | null): Set<string> {
  const { data: lists = [] } = useWishlist(userId)
  return useMemo(
    () => new Set(lists.flatMap(l => l.list_items.map(i => i.establishment_id))),
    [lists],
  )
}

export function useToggleSave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ establishmentId, isSaved }: { establishmentId: string; isSaved: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isSaved) {
        const { data: userLists } = await supabase
          .from('lists')
          .select('id')
          .eq('user_id', user.id)
        const listIds = (userLists ?? []).map(l => l.id)
        if (listIds.length > 0) {
          await supabase
            .from('list_items')
            .delete()
            .eq('establishment_id', establishmentId)
            .in('list_id', listIds)
        }
      } else {
        let listId: string | null = null
        const { data: existing } = await supabase
          .from('lists')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', 'Mes favoris')
          .maybeSingle()

        if (existing) {
          listId = existing.id
        } else {
          const { data: created } = await supabase
            .from('lists')
            .insert({ user_id: user.id, name: 'Mes favoris', is_public: false })
            .select('id')
            .single()
          listId = created?.id ?? null
        }

        if (listId) {
          await supabase
            .from('list_items')
            .insert({ list_id: listId, establishment_id: establishmentId })
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useRemoveFromList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      list_id,
      establishment_id,
    }: {
      list_id: string;
      establishment_id: string;
    }) => {
      const { error } = await supabase
        .from("list_items")
        .delete()
        .eq("list_id", list_id)
        .eq("establishment_id", establishment_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
