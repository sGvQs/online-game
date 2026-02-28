-- typing_shoot_matches の REPLICA IDENTITY を FULL に設定
-- （match_id フィルタ付き postgres_changes が正しく動作するために必要）
ALTER TABLE "typing_shoot_matches" REPLICA IDENTITY FULL;

-- typing_shoot_matches に SELECT ポリシーを追加
-- （RLS が有効なのにポリシーがないと postgres_changes が届かない）
CREATE POLICY "Allow select for everyone" ON public.typing_shoot_matches
FOR SELECT USING (true);
