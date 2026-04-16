DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

ALTER PUBLICATION supabase_realtime ADD TABLE
  rooms,
  room_users,
  matches,
  error_events,
  janken_events,
  typing_shoot_metrics,
  meteor_busters_matches;