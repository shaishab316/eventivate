-- CreateEnum
CREATE TYPE "ArtistAgentRlsReqStatus" AS ENUM ('PENDING', 'REJECTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "artist_agent_relations" (
    "id" TEXT NOT NULL,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artist_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "artist_agent_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_agent_relation_requests" (
    "id" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ArtistAgentRlsReqStatus" NOT NULL DEFAULT 'PENDING',
    "request_message" TEXT,
    "reject_message" TEXT,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,

    CONSTRAINT "artist_agent_relation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "artist_agent_relations_connected_at_idx" ON "artist_agent_relations"("connected_at");

-- CreateIndex
CREATE UNIQUE INDEX "artist_agent_relations_artist_id_agent_id_key" ON "artist_agent_relations"("artist_id", "agent_id");

-- CreateIndex
CREATE INDEX "artist_agent_relation_requests_requested_at_idx" ON "artist_agent_relation_requests"("requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "artist_agent_relation_requests_from_user_id_to_user_id_key" ON "artist_agent_relation_requests"("from_user_id", "to_user_id");

-- AddForeignKey
ALTER TABLE "artist_agent_relations" ADD CONSTRAINT "artist_agent_relations_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_agent_relations" ADD CONSTRAINT "artist_agent_relations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_agent_relation_requests" ADD CONSTRAINT "artist_agent_relation_requests_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_agent_relation_requests" ADD CONSTRAINT "artist_agent_relation_requests_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
