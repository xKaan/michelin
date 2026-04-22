-- Allow any authenticated user to read any user's mascot and outfits (for profile pages)
create policy "user_mascots_public_read" on user_mascots for select
  to authenticated
  using (true);

create policy "user_outfits_public_read" on user_outfits for select
  to authenticated
  using (true);
