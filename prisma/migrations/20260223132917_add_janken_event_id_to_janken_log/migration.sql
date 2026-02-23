-- AlterTable
ALTER TABLE "janken_logs" ADD COLUMN     "janken_event_id" UUID;

-- AddForeignKey
ALTER TABLE "janken_logs" ADD CONSTRAINT "janken_logs_janken_event_id_fkey" FOREIGN KEY ("janken_event_id") REFERENCES "janken_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
