-- CreateTable
CREATE TABLE "janken_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "current_host_id" UUID NOT NULL,
    "turn_number" INTEGER NOT NULL DEFAULT 1,
    "phase" TEXT NOT NULL DEFAULT 'SETUP',
    "phase_ends_at" TIMESTAMP(3) NOT NULL,
    "initial_hand" TEXT,
    "final_host_hand" TEXT,
    "fake_target" TEXT NOT NULL DEFAULT 'NONE',

    CONSTRAINT "janken_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_hands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "janken_event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hand" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "guest_hands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "janken_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "initial_hand" TEXT NOT NULL,
    "final_hand" TEXT NOT NULL,
    "match_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "janken_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_hands_janken_event_id_user_id_key" ON "guest_hands"("janken_event_id", "user_id");

-- CreateIndex
CREATE INDEX "janken_logs_user_id_initial_hand_idx" ON "janken_logs"("user_id", "initial_hand");

-- AddForeignKey
ALTER TABLE "janken_events" ADD CONSTRAINT "janken_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_hands" ADD CONSTRAINT "guest_hands_janken_event_id_fkey" FOREIGN KEY ("janken_event_id") REFERENCES "janken_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_hands" ADD CONSTRAINT "guest_hands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "janken_logs" ADD CONSTRAINT "janken_logs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "janken_logs" ADD CONSTRAINT "janken_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
