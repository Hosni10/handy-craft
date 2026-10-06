-- AlterTable
ALTER TABLE "custom_order_requests" ADD COLUMN     "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quoted_days" INTEGER,
ADD COLUMN     "seller_note" TEXT;

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN     "resolved_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivered_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "store_verifications" ADD COLUMN     "review_note" TEXT;

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "admin_note" TEXT;

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dispute_messages_dispute_id_idx" ON "dispute_messages"("dispute_id");

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
