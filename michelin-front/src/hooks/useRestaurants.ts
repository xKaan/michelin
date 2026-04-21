import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Establishment, EstablishmentView } from "@/types/database";

interface Coords {
  lat: number;
  lng: number;
}

export function useEstablishments(coords: Coords | null, radiusMeters = 5000) {
  return useQuery<Establishment[]>({
    queryKey: ["establishments", coords?.lat, coords?.lng, radiusMeters],
    enabled: !!coords,
    queryFn: async () => {
      if (!coords) return [];
      const { data, error } = await supabase.rpc("establishments_nearby", {
        lat: coords.lat,
        lng: coords.lng,
        radius_m: radiusMeters,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllEstablishments() {
  return useQuery<EstablishmentView[]>({
    queryKey: ['establishments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('establishments_view')
        .select('*')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useEstablishment(id: string | null) {
  return useQuery({
    queryKey: ["establishment", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Establishment;
    },
  });
}
