import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAllEstablishments } from "@/hooks/useRestaurants";

export interface MapReviewBubble {
  postId: string;
  userId: string;
  displayName: string;
  avatarColor: string;
  isGourmet: boolean;
  content: string;
  rating: number;
  lat: number;
  lng: number;
}

interface FeedPost {
  id: string;
  user_id: string;
  establishment_id: string;
  content: string;
  rating: number;
  created_at: string;
  user: { id: string; display_name: string; avatar_color: string; tier: string };
}

function useMapFeedPosts() {
  return useQuery<FeedPost[]>({
    queryKey: ["map-review-feed"],
    refetchOnMount: "always",
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: follows } = await supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", user.id);

      const followedIds = (follows ?? []).map((f: { followed_id: string }) => f.followed_id);
      const userIds = [user.id, ...followedIds];

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, user_id, establishment_id, content, rating, created_at,
          user:users!reviews_user_id_fkey(id, display_name, avatar_color, tier)
        `)
        .in("user_id", userIds)
        .eq("status", "published")
        .not("content", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as FeedPost[];
    },
  });
}

export function useMapReviewBubbles(): MapReviewBubble[] {
  const { data: posts = [] } = useMapFeedPosts();
  const { data: establishments = [] } = useAllEstablishments();

  const estMap = new Map(establishments.map(e => [e.id, e]));

  // One post per establishment: gourmet > most recent (posts already sorted desc)
  const best = new Map<string, FeedPost>();
  for (const post of posts) {
    const existing = best.get(post.establishment_id);
    if (!existing) {
      best.set(post.establishment_id, post);
    } else if (post.user.tier === "gourmet" && existing.user.tier !== "gourmet") {
      best.set(post.establishment_id, post);
    }
  }

  const bubbles: MapReviewBubble[] = [];
  for (const [estId, post] of best) {
    const est = estMap.get(estId);
    if (!est?.lat || !est?.lng) continue;
    bubbles.push({
      postId: post.id,
      userId: post.user_id,
      displayName: post.user.display_name,
      avatarColor: post.user.avatar_color,
      isGourmet: post.user.tier === "gourmet",
      content: post.content,
      rating: post.rating,
      lat: est.lat,
      lng: est.lng,
    });
  }

  return bubbles;
}
