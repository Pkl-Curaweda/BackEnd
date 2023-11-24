const { PrismaClient } = require('@prisma/client');
const logAvailabilityClient = new PrismaClient().logAvailability;

module.exports = { logAvailabilityClient };