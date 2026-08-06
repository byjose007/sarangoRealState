-- DropIndex
DROP INDEX "clients_email_idx";

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");
