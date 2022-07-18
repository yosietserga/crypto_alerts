-- CreateTable
CREATE TABLE "Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "status" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Property_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL DEFAULT 1,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Content_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "post_type" TEXT NOT NULL DEFAULT 'post',
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "expires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Session_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profile_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'group',
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ProfileToGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    "profileGroupId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Profile_Type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Profile" (
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
    CONSTRAINT "Profile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Person" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "firstname" TEXT,
    "lastname" TEXT,
    "gender" TEXT,
    "dateOfBirthday" DATETIME,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Person_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "personId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "file_session" TEXT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Account_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Store" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "image" TEXT,
    "status" INTEGER,
    "deleted" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ObjectToStore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PostToObject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "postId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL DEFAULT 0,
    "channelId" INTEGER NOT NULL DEFAULT 0,
    "objectId" INTEGER,
    "objectType" TEXT,
    "name" TEXT,
    "image" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "isAdmin" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL DEFAULT 0,
    "chatId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "body" TEXT,
    "params" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "messageId" INTEGER,
    "chatId" INTEGER,
    "storeId" INTEGER,
    "objectId" INTEGER,
    "objectType" TEXT,
    "body" TEXT,
    "params" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_uuid_key" ON "Property"("uuid");

-- CreateIndex
CREATE INDEX "object_index_property" ON "Property"("objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "Property_objectId_objectType_group_key_key" ON "Property"("objectId", "objectType", "group", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Content_uuid_key" ON "Content"("uuid");

-- CreateIndex
CREATE INDEX "object_index_content" ON "Content"("objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "Content_languageId_objectId_objectType_key" ON "Content"("languageId", "objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "Post_uuid_key" ON "Post"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Session_uuid_key" ON "Session"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_Group_uuid_key" ON "Profile_Group"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileToGroup_uuid_key" ON "ProfileToGroup"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileToGroup_profileId_profileGroupId_key" ON "ProfileToGroup"("profileId", "profileGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_Type_uuid_key" ON "Profile_Type"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_uuid_key" ON "Profile"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Person_uuid_key" ON "Person"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Person_phone_key" ON "Person"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Account_uuid_key" ON "Account"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_personId_key" ON "Account"("provider", "providerAccountId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_uuid_key" ON "Store"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Store_folder_key" ON "Store"("folder");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectToStore_uuid_key" ON "ObjectToStore"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectToStore_storeId_objectId_objectType_key" ON "ObjectToStore"("storeId", "objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "PostToObject_uuid_key" ON "PostToObject"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PostToObject_postId_objectId_objectType_key" ON "PostToObject"("postId", "objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_uuid_key" ON "Channel"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_uuid_key" ON "Chat"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_uuid_key" ON "ChatMember"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Message_uuid_key" ON "Message"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_uuid_key" ON "Attachment"("uuid");
