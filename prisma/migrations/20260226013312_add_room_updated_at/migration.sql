-- AlterTable: updated_at を DEFAULT 付きで追加（既存行があっても適用可能）
ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
