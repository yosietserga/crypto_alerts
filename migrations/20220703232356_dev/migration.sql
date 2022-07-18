/*
  Warnings:

  - You are about to drop the `Profile_Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile_Type` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `storeId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Made the column `storeId` on table `Attachment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `profileId` to the `ChatMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ChatMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Profile_Group_uuid_key";

-- DropIndex
DROP INDEX "Profile_Type_uuid_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Profile_Group";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Profile_Type";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProfileGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'group',
    "storeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ProfileType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL DEFAULT 0,
    "channelId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER,
    "objectType" TEXT,
    "ref" TEXT,
    "name" TEXT,
    "description" TEXT,
    "image" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Chat_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("categoryId", "channelId", "createdAt", "id", "image", "name", "objectId", "objectType", "storeId", "type", "updatedAt", "uuid") SELECT "categoryId", "channelId", "createdAt", "id", "image", "name", "objectId", "objectType", "storeId", "type", "updatedAt", "uuid" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE UNIQUE INDEX "Chat_uuid_key" ON "Chat"("uuid");
CREATE UNIQUE INDEX "Chat_channelId_ref_key" ON "Chat"("channelId", "ref");
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "personId" INTEGER NOT NULL,
    "profileTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Profile_profileTypeId_fkey" FOREIGN KEY ("profileTypeId") REFERENCES "ProfileType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("createdAt", "deleted", "id", "image", "name", "personId", "profileTypeId", "slug", "status", "storeId", "updatedAt", "uuid") SELECT "createdAt", "deleted", "id", "image", "name", "personId", "profileTypeId", "slug", "status", "storeId", "updatedAt", "uuid" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_uuid_key" ON "Profile"("uuid");
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "post_type" TEXT NOT NULL DEFAULT 'post',
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "storeId" INTEGER NOT NULL,
    "image" TEXT,
    "ref" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Post" ("createdAt", "deleted", "id", "image", "parentId", "post_type", "status", "updatedAt", "uuid") SELECT "createdAt", "deleted", "id", "image", "parentId", "post_type", "status", "updatedAt", "uuid" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_uuid_key" ON "Post"("uuid");
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "expires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Session_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "expires", "id", "personId", "sessionToken", "updatedAt", "uuid") SELECT "createdAt", "expires", "id", "personId", "sessionToken", "updatedAt", "uuid" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_uuid_key" ON "Session"("uuid");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE TABLE "new_Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "messageId" INTEGER,
    "chatId" INTEGER,
    "objectId" INTEGER,
    "objectType" TEXT,
    "ref" TEXT,
    "body" TEXT,
    "params" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Attachment" ("body", "chatId", "createdAt", "id", "messageId", "objectId", "objectType", "params", "storeId", "type", "updatedAt", "uuid") SELECT "body", "chatId", "createdAt", "id", "messageId", "objectId", "objectType", "params", "storeId", "type", "updatedAt", "uuid" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
CREATE UNIQUE INDEX "Attachment_uuid_key" ON "Attachment"("uuid");
CREATE TABLE "new_ChatMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "isAdmin" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_ChatMember" ("chatId", "createdAt", "id", "isAdmin", "personId", "status", "updatedAt", "uuid") SELECT "chatId", "createdAt", "id", "isAdmin", "personId", "status", "updatedAt", "uuid" FROM "ChatMember";
DROP TABLE "ChatMember";
ALTER TABLE "new_ChatMember" RENAME TO "ChatMember";
CREATE UNIQUE INDEX "ChatMember_uuid_key" ON "ChatMember"("uuid");
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Channel" ("createdAt", "id", "image", "name", "type", "updatedAt", "uuid") SELECT "createdAt", "id", "image", "name", "type", "updatedAt", "uuid" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_uuid_key" ON "Channel"("uuid");
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "storeId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "ref" TEXT,
    "body" TEXT,
    "params" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);
INSERT INTO "new_Message" ("body", "chatId", "createdAt", "id", "params", "parentId", "personId", "type", "updatedAt", "uuid") SELECT "body", "chatId", "createdAt", "id", "params", "parentId", "personId", "type", "updatedAt", "uuid" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_uuid_key" ON "Message"("uuid");
CREATE UNIQUE INDEX "Message_chatId_ref_key" ON "Message"("chatId", "ref");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "ProfileGroup_uuid_key" ON "ProfileGroup"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileType_uuid_key" ON "ProfileType"("uuid");
