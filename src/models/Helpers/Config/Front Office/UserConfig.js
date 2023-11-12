const { PrismaClient } = require('@prisma/client');
const userClient = new PrismaClient().user;

module.exports = { userClient };