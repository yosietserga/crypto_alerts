-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProfileGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'group',
    "profileTypeId" INTEGER NOT NULL DEFAULT 0,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "ProfileGroup_profileTypeId_fkey" FOREIGN KEY ("profileTypeId") REFERENCES "ProfileType" ("id") ON DELETE SET DEFAULT ON UPDATE CASCADE,
    CONSTRAINT "ProfileGroup_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET DEFAULT ON UPDATE CASCADE
);
INSERT INTO "new_ProfileGroup" ("createdAt", "deleted", "id", "image", "name", "status", "storeId", "type", "updatedAt", "uuid") SELECT "createdAt", "deleted", "id", "image", "name", "status", "storeId", "type", "updatedAt", "uuid" FROM "ProfileGroup";
DROP TABLE "ProfileGroup";
ALTER TABLE "new_ProfileGroup" RENAME TO "ProfileGroup";
CREATE UNIQUE INDEX "ProfileGroup_uuid_key" ON "ProfileGroup"("uuid");
CREATE TABLE "new_ProfileToGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    "profileGroupId" INTEGER NOT NULL,
    CONSTRAINT "ProfileToGroup_profileGroupId_fkey" FOREIGN KEY ("profileGroupId") REFERENCES "ProfileGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileToGroup_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProfileToGroup" ("id", "profileGroupId", "profileId", "uuid") SELECT "id", "profileGroupId", "profileId", "uuid" FROM "ProfileToGroup";
DROP TABLE "ProfileToGroup";
ALTER TABLE "new_ProfileToGroup" RENAME TO "ProfileToGroup";
CREATE UNIQUE INDEX "ProfileToGroup_uuid_key" ON "ProfileToGroup"("uuid");
CREATE UNIQUE INDEX "ProfileToGroup_profileId_profileGroupId_key" ON "ProfileToGroup"("profileId", "profileGroupId");
CREATE TABLE "new_ObjectToStore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "ObjectToStore_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "ProfileGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObjectToStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ObjectToStore" ("createdAt", "id", "objectId", "objectType", "storeId", "type", "updatedAt", "uuid") SELECT "createdAt", "id", "objectId", "objectType", "storeId", "type", "updatedAt", "uuid" FROM "ObjectToStore";
DROP TABLE "ObjectToStore";
ALTER TABLE "new_ObjectToStore" RENAME TO "ObjectToStore";
CREATE UNIQUE INDEX "ObjectToStore_uuid_key" ON "ObjectToStore"("uuid");
CREATE UNIQUE INDEX "ObjectToStore_storeId_objectId_objectType_key" ON "ObjectToStore"("storeId", "objectId", "objectType");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
