-- Miracle Witness Network newsroom schema.
-- Apply with:  supabase db query --linked --file supabase/migrations/001_newsroom.sql
--
-- Everything is written by the scanner using the service role key. Anonymous
-- clients never touch these tables directly, so RLS is on with no public policy
-- and reads go through the app's server components.

create table if not exists public.stories (
  id              text primary key,
  slug            text not null unique,
  headline        text not null,
  summary         text not null,
  desk            text not null check (desk in (
                    'rescue','revival','healing','provision','reunion',
                    'kindness','justice','renewal','underground',
                    'discovery','courage')),
  place           text,
  source_name     text not null,
  source_url      text not null,
  image_url       text,
  published_at    timestamptz not null,
  scanned_at      timestamptz not null default now(),
  weight          integer not null default 50 check (weight between 0 and 100),
  confidence      integer not null default 50 check (confidence between 0 and 100),
  reviewed_by     text not null default 'rules' check (reviewed_by in ('claude','rules')),
  corroborations  integer not null default 1 check (corroborations >= 1),
  -- Underground church reporting: naming the place can get people arrested, so
  -- the site prints "Location withheld" wherever this is true.
  location_sensitive boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists stories_published_idx on public.stories (published_at desc);
create index if not exists stories_desk_published_idx on public.stories (desk, published_at desc);
create index if not exists stories_scanned_idx on public.stories (scanned_at desc);

create table if not exists public.scan_runs (
  id              uuid primary key,
  started_at      timestamptz not null,
  finished_at     timestamptz,
  items_seen      integer not null default 0,
  items_kept      integer not null default 0,
  sources_ok      integer not null default 0,
  sources_failed  integer not null default 0,
  reviewer        text not null default 'rules' check (reviewer in ('claude','rules','mixed')),
  notes           text
);

create index if not exists scan_runs_started_idx on public.scan_runs (started_at desc);

create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  place       text,
  desk        text check (desk in (
                'rescue','revival','healing','provision','reunion',
                'kindness','justice','renewal','underground',
                    'discovery','courage')),
  story       text not null,
  status      text not null default 'new' check (status in ('new','reviewing','published','declined')),
  created_at  timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

alter table public.stories     enable row level security;
alter table public.scan_runs   enable row level security;
alter table public.submissions enable row level security;
