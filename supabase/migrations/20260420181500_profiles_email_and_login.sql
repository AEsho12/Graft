alter table public.profiles add column if not exists email text;

update public.profiles
set email = u.email
from auth.users u
where public.profiles.id = u.id
  and public.profiles.email is null;

alter table public.profiles
  alter column email set not null;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (email);

drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
for select using (auth.uid() = id);
