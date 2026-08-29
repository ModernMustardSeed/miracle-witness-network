# Miracle Witness Network

A newsroom that reports only the good, and can show its work for every line of it.

Every hour the scanner reads 17 wire feeds and 10 standing queries against
GDELT, throws out anything whose subject is a death, a crime or a catastrophe,
sends what survives to Claude to be judged and written, merges the reports that
turn out to be the same story, and files the result to nine desks.

Nothing on this site is invented. There are no witness counts, no souls-saved
tickers and no projections, because those cannot be counted. The only
verification number we print is how many independent outlets carried the same
story.

## Run it

```powershell
pnpm install
pnpm dev            # http://localhost:3007
```

The site publishes real stories with no credentials at all. Without a database
it reads the fast wire lane on demand and holds the result for fifteen minutes;
without an API key the keyword pass runs the paper on its own and every story
says so. See `/how-we-verify`, which is generated from the live configuration.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Without it |
| --- | --- |
| `ANTHROPIC_API_KEY` | The keyword pass places every story. Quality drops hard: it cannot tell a rescue from a disaster report that mentions one. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | No archive, no hourly accumulation, and the Send a Story form answers with the newsroom email instead of filing. |
| `CRON_SECRET` | `/api/cron/scan` refuses every request in production. |

## The database

One migration, applied against the linked project:

```powershell
supabase link --project-ref <ref>
supabase db query --linked --file supabase/migrations/001_newsroom.sql
```

## Commands

```powershell
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint, flat config
pnpm build                # production build
pnpm sources:check        # probe every feed and query, print what answered
pnpm scan:dry -- --fast   # one pass, feeds only, prints the edition, writes nothing
pnpm scan                 # full pass including GDELT, writes to the store
pnpm scan -- --rules      # prove the no-key path, spends no tokens
```

## How it fits together

```
lib/sources/*  fetch          RSS (fast lane) and GDELT (global lane)
lib/filter     screen         keyword veto, positive signal, desk guess
lib/scan       shortlist      one candidate per desk in turn, never top-90-by-weight
lib/classify   judge          Claude decides what runs and writes it, rules fall back
lib/cluster    merge + rank   same story from two outlets becomes one, with a count
lib/store      persist        Supabase when configured, in-memory when not
```

`app/api/cron/scan` runs the whole chain hourly and revalidates the pages that
read from it. `vercel.json` holds the schedule.

## Two rules that are not negotiable

**Nothing runs because bad news is absent.** An item must carry a positive
signal of its own. "Two rescued, twelve killed" is a disaster story and does not
run; we report the rescue when an outlet leads with the rescue.

**The Underground desk never carries a location.** Naming the place where
believers meet under a ban is exposure, not rigour. Those stories lose the city,
the district and the names before they reach the archive, and merging a withheld
story with a named one keeps the story withheld.

`/witness-roll` is the one page no scanner may write to. Its figures are
transcribed by hand from a named published report and updated only when that
report is.

Built by [Modern Mustard Seed](https://modernmustardseed.com).
