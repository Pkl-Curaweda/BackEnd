const { PrismaClient } = require("@prisma/client");
const orderClient = new PrismaClient().order;

module.exports = {orderClient};