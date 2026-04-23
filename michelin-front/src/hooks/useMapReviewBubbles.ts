import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAllEstablishments } from "@/hooks/useRestaurants";

export interface MapReviewBubble {
  postId: string;
  userId: string;
  displayName: string;
  avatarColor: string;
  isGourmet: boolean;
  isCritic: boolean;
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

interface CriticPost {
  id: string;
  user_id: string;
  establishment_id: string;
  content: string;
  rating: number;
  critic_name: string;
  likes_count: number;
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

function useMapCriticPosts() {
  return useQuery<CriticPost[]>({
    queryKey: ["map-critic-feed"],
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("critic_reviews")
        .select("id, user_id, establishment_id, content, rating, critic_name, likes_count")
        .eq("status", "published")
        .not("content", "is", null)
        .order("likes_count", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CriticPost[];
    },
  });
}

type BubbleSlot =
  | { type: "critic"; post: CriticPost }
  | { type: "gourmet" | "user"; post: FeedPost };

export function useMapReviewBubbles(): MapReviewBubble[] {
  const { data: posts = [] } = useMapFeedPosts();
  const { data: criticPosts = [] } = useMapCriticPosts();
  const { data: establishments = [] } = useAllEstablishments();

  const estMap = new Map(establishments.map(e => [e.id, e]));

  // Priority: critic > gourmet user > most-recent user (posts already sorted desc)
  const best = new Map<string, BubbleSlot>();

  for (const post of posts) {
    const existing = best.get(post.establishment_id);
    const isGourmet = post.user.tier === "gourmet";
    if (!existing) {
      best.set(post.establishment_id, { type: isGourmet ? "gourmet" : "user", post });
    } else if (isGourmet && existing.type === "user") {
      best.set(post.establishment_id, { type: "gourmet", post });
    }
  }

  // Critic reviews take absolute priority — keep the first (most liked, sorted desc)
  for (const post of criticPosts) {
    const existing = best.get(post.establishment_id);
    if (!existing || existing.type !== "critic") {
      best.set(post.establishment_id, { type: "critic", post });
    }
  }

  const bubbles: MapReviewBubble[] = [];
  for (const [estId, slot] of best) {
    const est = estMap.get(estId);
    if (!est?.lat || !est?.lng) continue;

    if (slot.type === "critic") {
      const cp = slot.post;
      bubbles.push({
        postId: cp.id,
        userId: cp.user_id,
        displayName: cp.critic_name,
        avatarColor: "#cb0028",
        isGourmet: false,
        isCritic: true,
        content: cp.content,
        rating: cp.rating,
        lat: est.lat,
        lng: est.lng,
      });
    } else {
      const fp = slot.post;
      bubbles.push({
        postId: fp.id,
        userId: fp.user_id,
        displayName: fp.user.display_name,
        avatarColor: fp.user.avatar_color,
        isGourmet: slot.type === "gourmet",
        isCritic: false,
        content: fp.content,
        rating: fp.rating,
        lat: est.lat,
        lng: est.lng,
      });
    }
  }

  // Critics first, then gourmets — so the overlap filter keeps highest-priority bubbles
  return bubbles.sort((a, b) => {
    if (a.isCritic !== b.isCritic) return a.isCritic ? -1 : 1;
    if (a.isGourmet !== b.isGourmet) return a.isGourmet ? -1 : 1;
    return 0;
  });
}
