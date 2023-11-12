const prisma = require('@prisma/client');

const PrismaDisconnect =  async () => {
    await prisma.$disconnect();
}

module.exports = { PrismaDisconnect };