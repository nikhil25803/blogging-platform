import { PrismaClient } from "@prisma/client";
import { ObjectId } from "bson";

const prisma = new PrismaClient();

async function main() {
  // Create new category
  const cid = new ObjectId();
  const newCategory = await prisma.category.create({
    data: {
      cid: cid.toString(),
      name: "Miscelleneous",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
