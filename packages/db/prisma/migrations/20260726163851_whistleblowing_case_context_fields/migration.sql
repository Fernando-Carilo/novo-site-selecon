-- AlterTable
ALTER TABLE "whistleblowing"."WhistleblowingCase" ADD COLUMN     "incidentDate" TIMESTAMP(3),
ADD COLUMN     "involvedPeopleDescription" TEXT,
ADD COLUMN     "location" TEXT;
