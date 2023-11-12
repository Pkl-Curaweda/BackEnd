const { PrismaClient } = require('@prisma/client');
const roomClient = new PrismaClient().room;

module.exports = {roomClient};