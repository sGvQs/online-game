ALTER TABLE "janken_events" REPLICA IDENTITY FULL;

-- janken_eventsテーブルに対して、誰でもデータを読み取れるようにする
CREATE POLICY "Allow select for everyone" ON public.janken_events
FOR SELECT USING (true);