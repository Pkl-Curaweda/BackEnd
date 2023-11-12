const { PrismaClient } = require("@prisma/client");
const guestClient = new PrismaClient().guest;

module.exports = { guestClient };