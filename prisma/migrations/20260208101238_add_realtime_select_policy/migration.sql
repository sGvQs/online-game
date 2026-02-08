-- roomsテーブルに対して、誰でもデータを読み取れるようにする
CREATE POLICY "Allow select for everyone" ON public.rooms
FOR SELECT USING (true);

-- room_usersテーブルなども同様に必要であれば実行
CREATE POLICY "Allow select for everyone" ON public.room_users
FOR SELECT USING (true);

-- matchesテーブルに対して、誰でもデータを読み取れるようにする
CREATE POLICY "Allow select for everyone" ON public.matches
FOR SELECT USING (true);

-- error_eventsテーブルなども同様に必要であれば実行
CREATE POLICY "Allow select for everyone" ON public.error_events
FOR SELECT USING (true);