const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomMaids = [
  {
    user: { connect: { id: 3 } },
    aliases: 'AL',
    workload: 0,
    shift: { connect: { id: 3 } },
    department: { connect: { id: 1 } }
  },
  {
    user: { connect: { id: 4 } },
    aliases: 'AR',
    workload: 0,
    shift: { connect: { id: 2 } },
    department: { connect: { id: 1 } }
  },
  {
    user: { connect: { id: 5 } },
    aliases: 'AQ',
    workload: 0,
    shift: { connect: { id: 1 } },
    department: { connect: { id: 1 } }
  },
];

async function roomMaidSeed() {
  for (let roomMaid of roomMaids) {
    await prisma.roomMaid.upsert({
      where: { id: roomMaid.user.connect.id },
      update: { ...roomMaid },
      create: { ...roomMaid }
    });
  }
}

module.exports = { roomMaidSeed };
