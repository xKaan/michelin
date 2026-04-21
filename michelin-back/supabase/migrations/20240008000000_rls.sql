alter table users enable row level security;
create policy "users_select" on users for select using (true);
create policy "users_update" on users for update using (auth.uid() = id);

alter table reviews enable row level security;
create policy "reviews_select_published" on reviews for select
  using (status = 'published' or auth.uid() = user_id);
create policy "reviews_insert" on reviews for insert
  with check (auth.uid() = user_id);
create policy "reviews_update_own" on reviews for update
  using (auth.uid() = user_id);

alter table checkins enable row level security;
create policy "checkins_owner" on checkins for all
  using (auth.uid() = user_id);

alter table user_qr_codes enable row level security;
create policy "qr_codes_owner" on user_qr_codes for all
  using (auth.uid() = user_id);

alter table user_mascots enable row level security;
create policy "user_mascots_owner" on user_mascots for all
  using (auth.uid() = user_id);

alter table user_outfits enable row level security;
create policy "user_outfits_owner" on user_outfits for all
  using (auth.uid() = user_id);

alter table lists enable row level security;
create policy "lists_select" on lists for select
  using (is_public = true or auth.uid() = user_id);
create policy "lists_insert" on lists for insert
  with check (auth.uid() = user_id);
create policy "lists_update_own" on lists for update
  using (auth.uid() = user_id);

alter table notifications enable row level security;
create policy "notifications_owner" on notifications for all
  using (auth.uid() = user_id);

alter table xp_events enable row level security;
create policy "xp_events_select_own" on xp_events for select
  using (auth.uid() = user_id);

alter table badges enable row level security;
create policy "badges_select" on badges for select using (true);

alter table streaks enable row level security;
create policy "streaks_select_own" on streaks for select
  using (auth.uid() = user_id);

alter table restaurants enable row level security;
create policy "restaurants_select" on restaurants for select using (true);

alter table reactions enable row level security;
create policy "reactions_select" on reactions for select using (true);
create policy "reactions_insert" on reactions for insert
  with check (auth.uid() = user_id);
create policy "reactions_delete_own" on reactions for delete
  using (auth.uid() = user_id);

alter table media enable row level security;
create policy "media_select" on media for select using (true);
create policy "media_insert" on media for insert
  with check (auth.uid() = user_id);
