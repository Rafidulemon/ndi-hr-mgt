-- Drop global notification seen flag in favor of per-user receipts
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "isSeen";

CREATE TABLE "NotificationReceipt" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "isSeen" BOOLEAN NOT NULL DEFAULT false,
  "seenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationReceipt_notificationId_userId_key"
  ON "NotificationReceipt" ("notificationId", "userId");

CREATE INDEX "NotificationReceipt_userId_idx"
  ON "NotificationReceipt" ("userId");

ALTER TABLE "NotificationReceipt"
  ADD CONSTRAINT "NotificationReceipt_notificationId_fkey"
  FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationReceipt"
  ADD CONSTRAINT "NotificationReceipt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
