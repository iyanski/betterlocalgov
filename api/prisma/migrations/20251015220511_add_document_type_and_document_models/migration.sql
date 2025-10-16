-- CreateTable
CREATE TABLE "document_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "document_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_types_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_types_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "documentTypeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_media_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_categories_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_tags_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "contentTypeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "content_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_content" ("content", "contentTypeId", "createdAt", "createdBy", "id", "organizationId", "publishedAt", "slug", "status", "title", "updatedAt", "updatedBy") SELECT "content", "contentTypeId", "createdAt", "createdBy", "id", "organizationId", "publishedAt", "slug", "status", "title", "updatedAt", "updatedBy" FROM "content";
DROP TABLE "content";
ALTER TABLE "new_content" RENAME TO "content";
CREATE INDEX "content_organizationId_idx" ON "content"("organizationId");
CREATE INDEX "content_status_idx" ON "content"("status");
CREATE INDEX "content_contentTypeId_idx" ON "content"("contentTypeId");
CREATE INDEX "content_publishedAt_idx" ON "content"("publishedAt");
CREATE INDEX "content_organizationId_status_idx" ON "content"("organizationId", "status");
CREATE INDEX "content_organizationId_status_publishedAt_idx" ON "content"("organizationId", "status", "publishedAt");
CREATE UNIQUE INDEX "content_organizationId_slug_key" ON "content"("organizationId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "document_types_slug_key" ON "document_types"("slug");

-- CreateIndex
CREATE INDEX "document_types_organizationId_idx" ON "document_types"("organizationId");

-- CreateIndex
CREATE INDEX "document_types_slug_idx" ON "document_types"("slug");

-- CreateIndex
CREATE INDEX "document_types_isActive_idx" ON "document_types"("isActive");

-- CreateIndex
CREATE INDEX "document_types_createdBy_idx" ON "document_types"("createdBy");

-- CreateIndex
CREATE INDEX "documents_documentTypeId_idx" ON "documents"("documentTypeId");

-- CreateIndex
CREATE INDEX "documents_organizationId_idx" ON "documents"("organizationId");

-- CreateIndex
CREATE INDEX "documents_slug_idx" ON "documents"("slug");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_publishedAt_idx" ON "documents"("publishedAt");

-- CreateIndex
CREATE INDEX "documents_createdBy_idx" ON "documents"("createdBy");

-- CreateIndex
CREATE INDEX "document_media_documentId_idx" ON "document_media"("documentId");

-- CreateIndex
CREATE INDEX "document_media_mediaId_idx" ON "document_media"("mediaId");

-- CreateIndex
CREATE INDEX "document_media_fieldName_idx" ON "document_media"("fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "document_media_documentId_mediaId_fieldName_key" ON "document_media"("documentId", "mediaId", "fieldName");

-- CreateIndex
CREATE INDEX "document_categories_documentId_idx" ON "document_categories"("documentId");

-- CreateIndex
CREATE INDEX "document_categories_categoryId_idx" ON "document_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_documentId_categoryId_key" ON "document_categories"("documentId", "categoryId");

-- CreateIndex
CREATE INDEX "document_tags_documentId_idx" ON "document_tags"("documentId");

-- CreateIndex
CREATE INDEX "document_tags_tagId_idx" ON "document_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "document_tags_documentId_tagId_key" ON "document_tags"("documentId", "tagId");

-- CreateIndex
CREATE INDEX "categories_organizationId_idx" ON "categories"("organizationId");

-- CreateIndex
CREATE INDEX "categories_organizationId_slug_idx" ON "categories"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- CreateIndex
CREATE INDEX "content_categories_contentId_idx" ON "content_categories"("contentId");

-- CreateIndex
CREATE INDEX "content_categories_categoryId_idx" ON "content_categories"("categoryId");

-- CreateIndex
CREATE INDEX "content_media_contentId_idx" ON "content_media"("contentId");

-- CreateIndex
CREATE INDEX "content_media_mediaId_idx" ON "content_media"("mediaId");

-- CreateIndex
CREATE INDEX "content_media_fieldName_idx" ON "content_media"("fieldName");

-- CreateIndex
CREATE INDEX "content_tags_contentId_idx" ON "content_tags"("contentId");

-- CreateIndex
CREATE INDEX "content_tags_tagId_idx" ON "content_tags"("tagId");

-- CreateIndex
CREATE INDEX "content_types_organizationId_idx" ON "content_types"("organizationId");

-- CreateIndex
CREATE INDEX "content_types_organizationId_slug_idx" ON "content_types"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "media_organizationId_idx" ON "media"("organizationId");

-- CreateIndex
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "media_organizationId_createdAt_idx" ON "media"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "tags_organizationId_idx" ON "tags"("organizationId");

-- CreateIndex
CREATE INDEX "tags_organizationId_slug_idx" ON "tags"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "tags_isActive_idx" ON "tags"("isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_organizationId_isActive_idx" ON "users"("organizationId", "isActive");
