-- Faz 8 — Freelancer AI bilirkişi tahkimi + PROJECT_EPHEMERAL squad (S49–S56).
-- Canlı migrate ayrı ops adımıdır. Studio IMAGE_GEN / akademi sınav / DevLabs tezgâh / KYC bu SQL'de yoktur.

-- CreateEnum
CREATE TYPE "FreelancerDisputeRoundStatus" AS ENUM ('ROUND_ONE_OPEN', 'ROUND_ONE_SUBMITTED', 'ROUND_TWO_SUBMITTED', 'AI_REPORT_READY', 'SETTLED', 'HUMAN_REVIEW');

-- CreateEnum
CREATE TYPE "FreelancerContractMessageKind" AS ENUM ('TEXT', 'DELIVERY', 'REVISION');

-- CreateEnum
CREATE TYPE "FreelancerSquadKind" AS ENUM ('PROJECT_EPHEMERAL');

-- CreateEnum
CREATE TYPE "FreelancerSquadStatus" AS ENUM ('FORMING', 'ACTIVE', 'DISBANDED');

-- CreateTable
CREATE TABLE "freelancer_disputes" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "initiator_user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "party_a_claim" TEXT NOT NULL,
    "party_b_rebuttal" TEXT,
    "round_status" "FreelancerDisputeRoundStatus" NOT NULL DEFAULT 'ROUND_ONE_SUBMITTED',
    "employer_refund_bps" INTEGER,
    "rationale" TEXT,
    "arbitration_ready" BOOLEAN NOT NULL DEFAULT false,
    "report_json" TEXT,
    "client_approved_at" TIMESTAMP(3),
    "freelancer_approved_at" TIMESTAMP(3),
    "rejected_by_user_id" TEXT,
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_contract_messages" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "freelancer_id" TEXT NOT NULL,
    "kind" "FreelancerContractMessageKind" NOT NULL,
    "body" TEXT NOT NULL,
    "artifact_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freelancer_contract_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_squads" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "kind" "FreelancerSquadKind" NOT NULL DEFAULT 'PROJECT_EPHEMERAL',
    "status" "FreelancerSquadStatus" NOT NULL DEFAULT 'FORMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_squad_members" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_bps" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freelancer_squad_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_disputes_contract_id_key" ON "freelancer_disputes"("contract_id");

-- CreateIndex
CREATE INDEX "freelancer_disputes_client_id_round_status_idx" ON "freelancer_disputes"("client_id", "round_status");

-- CreateIndex
CREATE INDEX "freelancer_disputes_freelancer_id_round_status_idx" ON "freelancer_disputes"("freelancer_id", "round_status");

-- CreateIndex
CREATE INDEX "freelancer_contract_messages_contract_id_created_at_idx" ON "freelancer_contract_messages"("contract_id", "created_at");

-- CreateIndex
CREATE INDEX "freelancer_contract_messages_user_id_idx" ON "freelancer_contract_messages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_squads_contract_id_key" ON "freelancer_squads"("contract_id");

-- CreateIndex
CREATE INDEX "freelancer_squads_user_id_status_idx" ON "freelancer_squads"("user_id", "status");

-- CreateIndex
CREATE INDEX "freelancer_squads_client_id_idx" ON "freelancer_squads"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_squad_members_squad_id_user_id_key" ON "freelancer_squad_members"("squad_id", "user_id");

-- CreateIndex
CREATE INDEX "freelancer_squad_members_user_id_idx" ON "freelancer_squad_members"("user_id");

-- AddForeignKey
ALTER TABLE "freelancer_disputes" ADD CONSTRAINT "freelancer_disputes_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "freelancer_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_disputes" ADD CONSTRAINT "freelancer_disputes_initiator_user_id_fkey" FOREIGN KEY ("initiator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_disputes" ADD CONSTRAINT "freelancer_disputes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_disputes" ADD CONSTRAINT "freelancer_disputes_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contract_messages" ADD CONSTRAINT "freelancer_contract_messages_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "freelancer_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contract_messages" ADD CONSTRAINT "freelancer_contract_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contract_messages" ADD CONSTRAINT "freelancer_contract_messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_contract_messages" ADD CONSTRAINT "freelancer_contract_messages_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_squads" ADD CONSTRAINT "freelancer_squads_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "freelancer_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_squads" ADD CONSTRAINT "freelancer_squads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_squads" ADD CONSTRAINT "freelancer_squads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_squad_members" ADD CONSTRAINT "freelancer_squad_members_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "freelancer_squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_squad_members" ADD CONSTRAINT "freelancer_squad_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
