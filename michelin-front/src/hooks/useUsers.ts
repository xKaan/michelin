import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/database";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
