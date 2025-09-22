-- Host reassignment robustness
-- This trigger reassigns host when the current host leaves the room_players table

create or replace function public.reassign_host_on_player_leave()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_host_id text;
begin
  -- Only act when the leaving player was the host of the room
  if exists (
    select 1 from public.rooms r
    where r.id = old.room_id and r.host_id = old.player_id
  ) then
    -- Pick the earliest joined remaining player as new host
    select rp.player_id into new_host_id
    from public.room_players rp
    where rp.room_id = old.room_id
    order by rp.joined_at asc
    limit 1;

    if new_host_id is not null then
      update public.rooms
      set host_id = new_host_id,
          updated_at = now()
      where id = old.room_id;
    else
      -- No players remain; leave host_id as-is; cleanup_empty_rooms should handle cleanup
      null;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_reassign_host_on_player_leave on public.room_players;
create trigger trg_reassign_host_on_player_leave
after delete on public.room_players
for each row
execute function public.reassign_host_on_player_leave();

