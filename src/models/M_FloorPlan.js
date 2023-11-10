const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllStatus = async () => {
  const fp = await prisma.RoomStatus.findMany()
  return fp;
};


module.exports = getAllStatus;
