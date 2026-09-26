-- OFF-101 muafiyet mührü. Satın alma ve sertifika değildir.
CREATE TABLE "academy_exemption_seals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_exemption_seals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_exemption_seals_user_id_course_id_key" ON "academy_exemption_seals"("user_id", "course_id");
CREATE INDEX "academy_exemption_seals_user_id_issued_at_idx" ON "academy_exemption_seals"("user_id", "issued_at");

ALTER TABLE "academy_exemption_seals" ADD CONSTRAINT "academy_exemption_seals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_exemption_seals" ADD CONSTRAINT "academy_exemption_seals_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "academy_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
