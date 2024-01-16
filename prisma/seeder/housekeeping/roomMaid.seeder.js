const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomMaids = [
  {
    user: { connect: { id: 1 } },
    aliases: 'AL',
    room: { connect: { id:1 } },
    priority: 1,
    department: { connect: { id: 1 } }
  },
  {
    user: { connect: { id: 2 } },
    aliases: 'AR',
    room: { connect: { id:1 } },
    priority: 2,
    department: { connect: { id:1 } }
  },
  {
    user: { connect: { id: 3 } },
    aliases: 'RA',
    room: { connect: { id:2 } },
    priority: 1,
    department: { connect: { id:2 } }
  },
];

async function roomMaidSeed(resvRoomId, roomId) {
  if (resvRoomId) {
    const roomMaids = await prisma.user.findMany({ where: { roleId: 3 } })
    const { id } = roomMaids[randomInt(roomMaids.length)]
    await prisma.roomMaid.create({
      data: {
        user: {
          connect: { id }
        },
        aliases: 'AA',
        room: { connect: {id: roomId } },
        priority: 1,
        department: { connect: { id: 2 } }
      }
    })
  } else {
    for (let roomMaid of roomMaids) {
      await prisma.roomMaid.create({
        data: roomMaid,
      });
    }
  }
}

module.exports = { roomMaidSeed };
