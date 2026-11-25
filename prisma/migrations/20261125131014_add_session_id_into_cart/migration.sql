/*
  Warnings:

  - You are about to drop the column `paymentId` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `carts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentId";

-- CreateIndex
CREATE UNIQUE INDEX "carts_sessionId_key" ON "carts"("sessionId");
