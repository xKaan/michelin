export type Tier = "explorer" | "member" | "gourmet" | "expert";
export type MichelinStatus = "none" | "bib" | "one" | "two" | "three";
export type ReviewStatus = "pending" | "published" | "flagged";
export type MediaType = "photo" | "video";
export type ReactionType = "like" | "flag";
export type XpAction = "checkin" | "review" | "photo" | "like" | "streak_bonus";
export type OutfitRarity = "common" | "rare" | "legendary";
export type UnlockCondition = "restaurant_visit" | "season" | "achievement";
export type UnlockedVia = "checkin" | "season" | "achievement";
export type VerificationMethod = "qr_scan" | "manual" | "oauth";
export type NotificationType =
  | "wishlist_nearby"
  | "friend_checkin"
  | "streak_reminder"
  | "outfit_unlocked";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  display_name: string;
  tier: Tier;
  xp_total: number;
  last_location: string | null;
  created_at: string;
}

export interface UserVerification {
  id: string;
  user_id: string;
  method: VerificationMethod;
  proof_ref: string | null;
  verified_at: string;
}

export interface Follow {
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  coordinates: string;
  address: string | null;
  city: string | null;
  country: string;
  michelin_status: MichelinStatus;
  cuisines: string[] | null;
  opening_hours: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface UserQrCode {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  restaurant_id: string;
  qr_code_id: string | null;
  gps_at_scan: string | null;
  checked_in_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  restaurant_id: string;
  checkin_id: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  likes_count: number;
  flags_count: number;
  published_at: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  review_id: string | null;
  user_id: string;
  url: string;
  type: MediaType;
  uploaded_at: string;
}

export interface Reaction {
  user_id: string;
  review_id: string;
  type: ReactionType;
  created_at: string;
}

export interface XpEvent {
  id: string;
  user_id: string;
  action: XpAction;
  xp_gained: number;
  ref_id: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  season: string | null;
  earned_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_count: number;
  best_count: number;
  last_activity_date: string | null;
}

export interface Mascot {
  id: string;
  name: string;
  base_species: string;
  description: string | null;
  released_at: string | null;
}

export interface UserMascot {
  id: string;
  user_id: string;
  mascot_id: string;
  is_active: boolean;
  nickname: string | null;
  xp: number;
  level: number;
  unlocked_at: string;
}

export interface Outfit {
  id: string;
  mascot_id: string;
  name: string;
  description: string | null;
  rarity: OutfitRarity;
  unlock_condition: UnlockCondition;
  restaurant_id: string | null;
  preview_url: string | null;
  released_at: string | null;
}

export interface UserOutfit {
  id: string;
  user_id: string;
  outfit_id: string;
  user_mascot_id: string;
  is_equipped: boolean;
  unlocked_via: UnlockedVia;
  unlocked_at: string;
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  restaurant_id: string;
  added_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown> | null;
  read: boolean;
  sent_at: string;
}

// ── Enriched types (JOIN results) ──────────────────────────────────────────

export interface ReviewWithMedia extends Review {
  media: Media[];
  user: Pick<User, "id" | "display_name" | "tier">;
}

export interface UserMascotWithOutfit extends UserMascot {
  mascot: Mascot;
  equipped_outfit: (UserOutfit & { outfit: Outfit }) | null;
}

export interface UserProfile extends User {
  streak: Streak | null;
  badges: Badge[];
}

export interface ListWithItems extends List {
  list_items: (ListItem & { restaurant: Restaurant })[];
}
