-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_guestId_fkey";

-- AlterTable: keep an audit snapshot so deleting a guest no longer erases the history
ALTER TABLE "AccessLog" ADD COLUMN "guestName" TEXT;
UPDATE "AccessLog" AS log
SET "guestName" = guest."name"
FROM "Guest" AS guest
WHERE log."guestId" = guest."id";
UPDATE "AccessLog"
SET "guestName" = 'Invitado eliminado'
WHERE "guestName" IS NULL;
ALTER TABLE "AccessLog" ALTER COLUMN "guestName" SET NOT NULL;
ALTER TABLE "AccessLog" ALTER COLUMN "guestId" DROP NOT NULL;

-- AlterTable: normalized name for accent-insensitive search
ALTER TABLE "Guest" ADD COLUMN "searchName" TEXT;
UPDATE "Guest"
SET "searchName" = trim(
  regexp_replace(
    lower(translate(
      "name",
      'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
      'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
    )),
    '\s+',
    ' ',
    'g'
  )
);
ALTER TABLE "Guest" ALTER COLUMN "searchName" SET NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Guest_eventId_searchName_idx" ON "Guest"("eventId", "searchName");

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
