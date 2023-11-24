const { PrismaClient } = require('@prisma/client');
const specialTreatmentClient = new PrismaClient().specialTreatment;

module.exports = { specialTreatmentClient }