const { PrismaClient } = require("@prisma/client");
const guestTokenClient = new PrismaClient().guestToken;
const userTokenClient = new PrismaClient().userToken;

module.exports = { guestTokenClient, userTokenClient };