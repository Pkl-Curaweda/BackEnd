const prisma = require("../db/index");

const findAvail = async () => {
    const avail = await prisma.room.findMany();
    return avail;
};

module.exports = { findAvail };