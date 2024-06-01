// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const initialLevelConfig = {
  1: [
    { id: 1, name: "Box 1", color: "bg-blue-500" },
    { id: 2, name: "Box 2", color: "bg-green-500" },
    { id: 3, name: "Box 3", color: "bg-yellow-500" },
    { id: 4, name: "Box 4", color: "bg-red-500" },
    { id: 5, name: "Box 5", color: "bg-blue-500" },
    { id: 6, name: "Box 6", color: "bg-green-500" },
    { id: 7, name: "Box 7", color: "bg-yellow-500" },
    { id: 8, name: "Box 8", color: "bg-red-500" },
    { id: 9, name: "Box 9", color: "bg-blue-500" },
    { id: 10, name: "Box 10", color: "bg-green-500" },
    { id: 11, name: "Box 11", color: "bg-yellow-500" },
    { id: 12, name: "Box 12", color: "bg-red-500" },
    { id: 13, name: "Box 13", color: "bg-blue-500" },
    { id: 14, name: "Box 14", color: "bg-green-500" },
    { id: 15, name: "Box 15", color: "bg-yellow-500" },
    { id: 16, name: "Box 16", color: "bg-red-500" },
    { id: 17, name: "Box 17", color: "bg-blue-500" },
    { id: 18, name: "Box 18", color: "bg-green-500" },
    { id: 19, name: "Box 19", color: "bg-yellow-500" },
    { id: 20, name: "Box 20", color: "bg-red-500" },
    { id: 21, name: "Box 21", color: "bg-blue-500" },
    { id: 22, name: "Box 22", color: "bg-green-500" },
    { id: 23, name: "Box 23", color: "bg-green-500" },
    { id: 24, name: "Box 24", color: "bg-green-500" },
    { id: 25, name: "Box 25", color: "bg-green-500" },
    { id: 26, name: "Box 26", color: "bg-green-500" },
    { id: 27, name: "Box 27", color: "bg-green-500" },
  ],
  2: [
    { id: 28, name: "Box Z", color: "bg-blue-500" },
    { id: 29, name: "Box A", color: "bg-green-500" },
    { id: 30, name: "Box C", color: "bg-red-500" },
    { id: 31, name: "Box D", color: "bg-blue-500" },
    { id: 32, name: "Box E", color: "bg-green-500" },
    { id: 33, name: "Box F", color: "bg-yellow-500" },
    { id: 34, name: "Box G", color: "bg-red-500" },
    { id: 35, name: "Box H", color: "bg-blue-500" },
    { id: 36, name: "Box I", color: "bg-green-500" },
    { id: 37, name: "Box J", color: "bg-yellow-500" },
    { id: 38, name: "Box K", color: "bg-red-500" },
    { id: 39, name: "Box L", color: "bg-blue-500" },
    { id: 40, name: "Box M", color: "bg-green-500" },
    { id: 41, name: "Box N", color: "bg-yellow-500" },
    { id: 42, name: "Box O", color: "bg-red-500" },
    { id: 43, name: "Box P", color: "bg-blue-500" },
    { id: 44, name: "Box Q", color: "bg-green-500" },
    { id: 45, name: "Box R", color: "bg-yellow-500" },
    { id: 46, name: "Box S", color: "bg-red-500" },
    { id: 47, name: "Box T", color: "bg-blue-500" },
    { id: 48, name: "Box U", color: "bg-green-500" },
    { id: 49, name: "Box V", color: "bg-green-500" },
    { id: 50, name: "Box W", color: "bg-green-500" },
    { id: 51, name: "Box X", color: "bg-green-500" },
    { id: 52, name: "Box Y", color: "bg-green-500" },    
    { id: 53, name: "Box B", color: "bg-yellow-500" },    
    { id: 54, name: "Box AB", color: "bg-yellow-500" },
  ]
};

async function main() {
  try {
    for (const [level, boxes] of Object.entries(initialLevelConfig)) {
      for (const box of boxes) {
        await prisma.box.create({
          data: {
            boxNumber: box.id.toString(),
            name: box.name,
            color: box.color,
            level: parseInt(level),
          }
        });
      }
    }
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
