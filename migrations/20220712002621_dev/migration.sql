/*
  Warnings:

  - You are about to drop the column `storeId` on the `Content` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL DEFAULT 1,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Content" ("createdAt", "description", "id", "languageId", "objectId", "objectType", "seoDescription", "seoTitle", "slug", "status", "title", "updatedAt", "uuid") SELECT "createdAt", "description", "id", "languageId", "objectId", "objectType", "seoDescription", "seoTitle", "slug", "status", "title", "updatedAt", "uuid" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
CREATE UNIQUE INDEX "Content_uuid_key" ON "Content"("uuid");
CREATE INDEX "object_index_content" ON "Content"("objectId", "objectType");
CREATE UNIQUE INDEX "Content_languageId_objectId_objectType_key" ON "Content"("languageId", "objectId", "objectType");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
