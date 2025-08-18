-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "applianceType" TEXT NOT NULL,
    "applianceOther" TEXT,
    "brand" TEXT NOT NULL,
    "brandOther" TEXT,
    "serialNumber" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "serviceAddress" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");
