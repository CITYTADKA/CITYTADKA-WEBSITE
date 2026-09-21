-- ============================================================================
-- FIX: Right now, when someone logs in for the first time, Supabase creates
-- their login record — but NOT their matching row in our own "users" table
-- (the one that tracks role: reader/editor/partner/admin). Without that row,
-- some features can quietly fail. This trigger creates it automatically,
-- every time, going forward.
--
-- HOW TO RUN: Supabase → SQL Editor → New query → paste this whole file → Run.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'reader')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- BACKFILL: creates a row for anyone who already logged in before this fix
-- existed (e.g. your own test logins from yesterday).
-- ============================================================================
insert into public.users (id, email, role)
select id, email, 'reader'
from auth.users
on conflict (id) do nothing;

-- ============================================================================
-- MAKE YOURSELF AN EDITOR: replace the email below with the exact email you
-- logged in with yesterday, then run just this last part.
-- ============================================================================
update public.users
set role = 'editor'
where email = 'surat@citytadka.com';
