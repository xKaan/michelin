import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/database";

export interface SocialPost {
  id: string;
  user_id: string;
  establishment_id: string;
  content: string | null;
  rating: number;
  likes_count: number;
  published_at: string | null;
  created_at: string;
  user: Pick<User, "id" | "display_name" | "avatar_color">;
  establishment: { name: string; city: string | null };
  media: { id: string; url: string; type: string }[];
}

export function useSocialFeed() {
  return useQuery<SocialPost[]>({
    queryKey: ["social-feed"],
    refetchOnMount: "always",
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: follows } = await supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", user.id);

      const followedIds = (follows ?? []).map((f) => f.followed_id);
      const userIds = [user.id, ...followedIds];

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, user_id, establishment_id, content, rating, likes_count, published_at, created_at,
          user:users!reviews_user_id_fkey(id, display_name, avatar_color),
          establishment:establishments!reviews_restaurant_id_fkey(name, city),
          media(id, url, type)
        `)
        .in("user_id", userIds)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as SocialPost[];
    },
  });
}

export function useMyLikes() {
  return useQuery<Set<string>>({
    queryKey: ["my-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set<string>();

      const { data } = await supabase
        .from("reactions")
        .select("review_id")
        .eq("user_id", user.id)
        .eq("type", "like");

      return new Set((data ?? []).map((r) => r.review_id));
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, isLiked }: { reviewId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("user_id", user.id)
          .eq("review_id", reviewId)
          .eq("type", "like");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reactions")
          .insert({ user_id: user.id, review_id: reviewId, type: "like" });
        if (error) throw error;
      }
    },
    onMutate: async ({ reviewId, isLiked }) => {
      await qc.cancelQueries({ queryKey: ["my-likes"] });
      const prev = qc.getQueryData<Set<string>>(["my-likes"]);
      qc.setQueryData<Set<string>>(["my-likes"], (old) => {
        const next = new Set(old);
        if (isLiked) next.delete(reviewId);
        else next.add(reviewId);
        return next;
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["my-likes"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["my-likes"] });
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export function useFollowing(userId: string | null) {
  return useQuery<User[]>({
    queryKey: ["following", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("followed:users!follows_followed_id_fkey(id, display_name, email, tier, xp_total, phone, avatar_color, created_at)")
        .eq("follower_id", userId!);

      if (error) throw error;
      return (data ?? []).map((f) => f.followed) as unknown as User[];
    },
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, followed_id: targetId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("followed_id", targetId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["following"] });
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      establishment_id,
      content,
      rating,
      imageFile,
    }: {
      establishment_id: string;
      content: string;
      rating: number;
      imageFile?: File;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: checkin, error: checkinErr } = await supabase
        .from("checkins")
        .insert({ user_id: user.id, establishment_id })
        .select()
        .single();
      if (checkinErr) throw checkinErr;

      const { data: review, error: reviewErr } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          establishment_id,
          checkin_id: checkin.id,
          rating,
          content,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (reviewErr) throw reviewErr;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("posts")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(path);

        await supabase.from("media").insert({
          user_id: user.id,
          review_id: review.id,
          url: publicUrl,
          type: "photo",
        });
      }

      return review;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: SocialPost) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== post.user_id) throw new Error("Unauthorized");

      // Reactions (no cascade on FK, delete manually)
      await supabase.from("reactions").delete().eq("review_id", post.id);

      // Storage files from the 'posts' bucket
      const photoPaths = post.media
        .filter((m) => m.type === "photo")
        .map((m) => {
          const match = m.url.match(/\/object\/public\/posts\/(.+)/);
          return match?.[1] ?? null;
        })
        .filter(Boolean) as string[];
      if (photoPaths.length > 0) {
        await supabase.storage.from("posts").remove(photoPaths);
      }

      // Media records (no cascade)
      await supabase.from("media").delete().eq("review_id", post.id);

      // Review (comments cascade via ON DELETE CASCADE)
      const { error } = await supabase.from("reviews").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: Pick<User, "id" | "display_name" | "avatar_color">;
}

export function useComments(reviewId: string, enabled: boolean) {
  return useQuery<Comment[]>({
    queryKey: ["comments", reviewId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id, review_id, user_id, content, created_at,
          user:users!comments_user_id_fkey(id, display_name)
        `)
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Comment[];
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("comments").insert({
        review_id: reviewId,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, { reviewId }) => {
      qc.invalidateQueries({ queryKey: ["comments", reviewId] });
    },
  });
}