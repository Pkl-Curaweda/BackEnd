const { PrismaClient } = require('@prisma/client');
const ResvRoomClient = new PrismaClient().resvRoom;

module.exports = { ResvRoomClient };