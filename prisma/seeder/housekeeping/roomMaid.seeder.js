const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomMaids = [
  {
    usedId: 1,
    aliases: 'AL',
    roomId: 1,
    priority: 1,
    departmentId: 1
  },
  {
    userId: 2,
    aliases: 'AR',
    roomId: 1,
    priority: 2,
    departmentId: 1
  },
  {
    userId: 3,
    aliases: 'RA',
    roomId: 2,
    priority: 1,
    departmentId: 2
  },
];

async function roomMaidSeed(resvRoomId, roomId) {
  if(resvRoomId){
    const roomMaids = await prisma.user.findMany({ where: { roleId: 3 }})
    const { id } = roomMaids[randomInt(roomMaids.length)]
    await prisma.roomMaid.create({
      data: {
        userId: id,
        aliases: 'AA',
        roomId,
        priority: 1,
        departmentId: 2
      }
    })
  }else{
    for (let roomMaid of roomMaids) {
      await prisma.roomMaid.create({
        data: roomMaid,
      });
    }
  }
}

module.exports = { roomMaidSeed };
