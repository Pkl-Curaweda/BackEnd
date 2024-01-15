const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomMaids = [
  {
    userId: 1,
    roomStatusId: 1,
    departmentId: 2,
    resvRoomId: 1,
    no: "A01",
    done: true,
    from: new Date(),
    to: new Date(),
    note: "Some room maid note...",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    roomStatusId: 2,
    departmentId: 2,
    resvRoomId: 1,
    no: "A02",
    done: false,
    from: new Date(),
    to: new Date(),
    note: "foo bar baz",
    created_at: new Date(),
    updated_at: new Date(),
  }
];

async function roomMaidSeed(resvRoomId) {
  if(resvRoomId){
    const roomMaids = await prisma.user.findMany({ where: { roleId: 3 }})
    const { id } = roomMaids[randomInt(roomMaids.length)]
    await prisma.roomMaid.create({
      data: {
        userId: id,
        roomStatusId: 1,
        departmentId: 1,
        resvRoomId,
        no: 'A03',
        done: true,
        from: new Date(),
        to: new Date(),
        note: 'Too clean',
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
