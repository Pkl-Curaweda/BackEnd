const { PrismaClient } = require('@prisma/client');
const roomStatusClient = new PrismaClient().roomStatus;

module.exports ={ roomStatusClient };