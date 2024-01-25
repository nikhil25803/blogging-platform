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
  console.log(newCategory);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
