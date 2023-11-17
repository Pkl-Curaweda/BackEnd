const { prisma } = require("../../../prisma/seeder/config");

const PrismaDisconnect =  async () => {
    await prisma.$disconnect();
}

module.exports = { PrismaDisconnect };