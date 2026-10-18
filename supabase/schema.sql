-- English Quest専用プロジェクト向け。利用者ごとに1つの学習スナップショットを保存。
create table public.english_quest_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  constraint progress_format check (
    jsonb_typeof(progress) = 'object'
    and progress ?& array['schemaVersion','xp','answered','correct','sessions','questionStats','reviewIds','studyDates']
    and progress->>'schemaVersion' = '2'
    and jsonb_typeof(progress->'questionStats') = 'object'
    and jsonb_typeof(progress->'reviewIds') = 'array'
    and jsonb_typeof(progress->'studyDates') = 'array'
    and pg_column_size(progress) <= 4194304
  )
);
alter table public.english_quest_progress enable row level security;
revoke all on public.english_quest_progress from public, anon, authenticated;
grant select, insert, update on public.english_quest_progress to authenticated;

create policy "read_own_progress" on public.english_quest_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert_own_progress" on public.english_quest_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update_own_progress" on public.english_quest_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

comment on table public.english_quest_progress is
  'English Quest v2 progress. Client updates use user_id + previous revision as compare-and-swap. No cross-user access or anonymous access.';
