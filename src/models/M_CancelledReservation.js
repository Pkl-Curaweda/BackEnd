const prisma = require("../db/index");

const getAllCancelled = async () => {
  const cancelled = await prisma.canceledReservation.findMany();
  return cancelled;
};

module.exports = getAllCancelled;