-- CreateTable: persist uploaded property images and documents in Postgres so
-- container rebuilds/redeploys never lose uploaded files when no host volume
-- is mounted at /app/uploads.
CREATE TABLE "uploaded_files" (
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("filename")
);

