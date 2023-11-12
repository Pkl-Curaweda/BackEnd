const { PrismaClient } = require('@prisma/client');
const reservationClient = new PrismaClient().reservation;

module.exports = {reservationClient};