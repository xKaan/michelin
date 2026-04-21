import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Restaurant } from "@/types/database";

interface Coords {
  lat: number;
  lng: number;
}

export function useRestaurants(coords: Coords | null, radiusMeters = 5000) {
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants", coords?.lat, coords?.lng, radiusMeters],
    enabled: !!coords,
    queryFn: async () => {
      if (!coords) return [];
      const { data, error } = await supabase.rpc("restaurants_nearby", {
        lat: coords.lat,
        lng: coords.lng,
        radius_m: radiusMeters,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRestaurant(id: string | null) {
  return useQuery({
    queryKey: ["restaurant", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Restaurant;
    },
  });
}
