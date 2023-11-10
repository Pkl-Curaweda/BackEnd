const prisma = require("../db/index");

const getAllStatus = async () => {
  const fp = await prisma.RoomStatus.findMany();
  return fp;
};

module.exports = getAllStatus;
