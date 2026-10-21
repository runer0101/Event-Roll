-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('GUARD', 'COORDINATOR', 'COOK', 'MUSIC', 'DECOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'DONE');

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "canCheckIn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "StaffRole" NOT NULL DEFAULT 'GUARD';

-- CreateTable
CREATE TABLE "EventTable" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chair" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "occupied" BOOLEAN NOT NULL DEFAULT false,
    "guestName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTable_eventId_idx" ON "EventTable"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTable_eventId_name_key" ON "EventTable"("eventId", "name");

-- CreateIndex
CREATE INDEX "Chair_eventId_idx" ON "Chair"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Chair_tableId_number_key" ON "Chair"("tableId", "number");

-- CreateIndex
CREATE INDEX "ScheduleItem_eventId_startAt_idx" ON "ScheduleItem"("eventId", "startAt");

-- CreateIndex
CREATE INDEX "ScheduleItem_assigneeId_idx" ON "ScheduleItem"("assigneeId");

-- AddForeignKey
ALTER TABLE "EventTable" ADD CONSTRAINT "EventTable_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTable" ADD CONSTRAINT "EventTable_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chair" ADD CONSTRAINT "Chair_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chair" ADD CONSTRAINT "Chair_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chair" ADD CONSTRAINT "Chair_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "EventTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
