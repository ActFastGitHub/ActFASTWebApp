import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const boxes = [
    ...Array.from({ length: 12 }, (_, i) => ({
      boxNumber: `V1${String(i).padStart(2, "0")}`, // V100–V111
      name: "",
      color: "bg-green-500",
      level: 3,
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
      boxNumber: `V2${String(i).padStart(2, "0")}`, // V200–V211
      name: "",
      color: "bg-green-500",
      level: 4,
    })),
  ];

  for (const box of boxes) {
    await prisma.box.upsert({
      where: { boxNumber: box.boxNumber },
      update: box,
      create: box,
    });
  }

  console.log("✅ Successfully seeded 24 new boxes for levels 3 and 4.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding boxes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
