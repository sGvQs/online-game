-- 旧 spread_small / spread_medium / spread_large を削除（新仕様で spread 1種類に統合）
DELETE FROM "star_shield_user_special_attacks"
WHERE "special_attack_id" IN ('spread_small', 'spread_medium', 'spread_large');

-- loadout の無効な選択をリセット
UPDATE "star_shield_user_progress"
SET "selected_special_attack_id" = NULL
WHERE "selected_special_attack_id" IN ('spread_small', 'spread_medium', 'spread_large');
