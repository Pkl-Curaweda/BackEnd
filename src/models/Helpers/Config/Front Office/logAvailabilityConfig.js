const { PrismaClient } = require('@prisma/client');
const logAvail = new PrismaClient().logAvailability;

module.exports = {logAvail};