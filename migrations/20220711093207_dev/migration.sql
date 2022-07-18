/*
  Warnings:

  - You are about to drop the column `storeId` on the `Property` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "status" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Property" ("createdAt", "dataType", "group", "id", "key", "objectId", "objectType", "status", "updatedAt", "uuid", "value") SELECT "createdAt", "dataType", "group", "id", "key", "objectId", "objectType", "status", "updatedAt", "uuid", "value" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_uuid_key" ON "Property"("uuid");
CREATE INDEX "object_index_property" ON "Property"("objectId", "objectType");
CREATE UNIQUE INDEX "Property_objectId_objectType_group_key_key" ON "Property"("objectId", "objectType", "group", "key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
