const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomMaids = [
  {
    user: { connect: { id: 2 } },
    aliases: 'AL',
    workload: 0,
    currentSchedule: '14:00',
    shift: { connect:  { id: 3 } },
    department: { connect: { id: 1 } }
  },
  {
    user: { connect: { id: 3 } },
    aliases: 'AR',
    workload: 0,
    currentSchedule: '09:00',
    shift: { connect: { id: 2 } },
    department: { connect: { id:1 } }
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
        workload: 0,
        shift:{
          connect: { id: 1 },
        },
        currentSchedule: '06:00',
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
