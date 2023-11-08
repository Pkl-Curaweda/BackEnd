const { PrismaClient } = require('@prisma/client');
const reservationClient = new PrismaClient().reservation;

const getAllReservation = async () => {
    const reservations = await reservationClient.findMany();
    return reservations;
}

module.exports = { getAllReservation };