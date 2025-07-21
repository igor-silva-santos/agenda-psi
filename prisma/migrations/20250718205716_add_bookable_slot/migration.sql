-- CreateTable
CREATE TABLE "BookableSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDateTime" DATETIME NOT NULL,
    "endDateTime" DATETIME NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false
);
