alter table public.profiles
  drop constraint if exists username_format;

alter table public.profiles
  add constraint username_format check (
    username ~ '^[A-Za-z0-9-]{3,24}$'
    and username !~ '(^-|-$|--)'
  );
