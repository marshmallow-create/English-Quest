-- 新規のユーザー名認証用。公開クライアントにはこのテーブル・関数への権限を与えない。
create schema if not exists private;
create table private.english_quest_auth_attempts (
  bucket_start timestamptz not null,
  bucket_key text not null check (length(bucket_key)=64),
  attempts integer not null check (attempts>0),
  primary key (bucket_start,bucket_key)
);
alter table private.english_quest_auth_attempts enable row level security;
revoke all on private.english_quest_auth_attempts from public,anon,authenticated;
grant usage on schema private to service_role;
grant select,insert,update,delete on private.english_quest_auth_attempts to service_role;

create function public.english_quest_take_auth_attempt(p_bucket_key text,p_attempt_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare start_at timestamptz; changed integer;
begin
  if p_bucket_key is null or p_attempt_limit is null or length(p_bucket_key)<>64 or p_attempt_limit<1 or p_attempt_limit>100 then
    raise exception 'Invalid attempt bucket';
  end if;
  start_at := to_timestamp(floor(extract(epoch from clock_timestamp())/600)*600);
  delete from private.english_quest_auth_attempts where bucket_start < clock_timestamp()-interval '1 day';
  insert into private.english_quest_auth_attempts as target(bucket_start,bucket_key,attempts)
    values(start_at,p_bucket_key,1)
    on conflict(bucket_start,bucket_key) do update set attempts=target.attempts+1
    where target.attempts < p_attempt_limit;
  get diagnostics changed = row_count;
  return changed=1;
end $$;
revoke all on function public.english_quest_take_auth_attempt(text,integer) from public,anon,authenticated;
grant execute on function public.english_quest_take_auth_attempt(text,integer) to service_role;
