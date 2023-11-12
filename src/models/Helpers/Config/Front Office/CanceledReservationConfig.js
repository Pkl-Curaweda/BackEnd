const { PrismaClient } = require('@prisma/client');
const canceledReservationClient = new PrismaClient().canceledReservation;

module.exports = { canceledReservationClient };