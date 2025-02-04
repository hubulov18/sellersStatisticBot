-- CreateTable
CREATE TABLE "TelegramUser" (
    "id" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstName" VARCHAR(200) NOT NULL,
    "lastName" VARCHAR(200),
    "username" VARCHAR(200),
    "phone" VARCHAR(200),
    "chatId" BIGINT NOT NULL,
    "firstActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(200),
    "showTime" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUserAction" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "action" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramUserAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OzonApiKeys" (
    "id" SERIAL NOT NULL,
    "keyId" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "isObserved" BOOLEAN NOT NULL DEFAULT false,
    "telegramUserId" BIGINT NOT NULL,

    CONSTRAINT "OzonApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WbApiKeys" (
    "id" SERIAL NOT NULL,
    "keyId" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "isObserved" BOOLEAN NOT NULL DEFAULT false,
    "telegramUserId" BIGINT NOT NULL,

    CONSTRAINT "WbApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telegramUserId" BIGINT NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_chatId_key" ON "TelegramUser"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_token_key" ON "Sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_telegramUserId_key" ON "Sessions"("telegramUserId");

-- AddForeignKey
ALTER TABLE "TelegramUserAction" ADD CONSTRAINT "TelegramUserAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OzonApiKeys" ADD CONSTRAINT "OzonApiKeys_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WbApiKeys" ADD CONSTRAINT "WbApiKeys_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "TelegramUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
