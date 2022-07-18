-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostToCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "PostToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostToCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "post_type" TEXT NOT NULL DEFAULT 'post',
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "storeId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "image" TEXT,
    "ref" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "publishAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Post_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("createdAt", "deleted", "id", "image", "parentId", "post_type", "ref", "status", "storeId", "updatedAt", "uuid") SELECT "createdAt", "deleted", "id", "image", "parentId", "post_type", "ref", "status", "storeId", "updatedAt", "uuid" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_uuid_key" ON "Post"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Category_uuid_key" ON "Category"("uuid");

-- CreateIndex
CREATE INDEX "category_index" ON "Category"("objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "PostToCategory_uuid_key" ON "PostToCategory"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PostToCategory_postId_categoryId_key" ON "PostToCategory"("postId", "categoryId");
