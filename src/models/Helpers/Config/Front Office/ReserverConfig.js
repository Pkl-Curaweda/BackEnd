const { PrismaClient } = require("@prisma/client");
const reserverClient = new PrismaClient().reserver;

module.exports = { reserverClient };
