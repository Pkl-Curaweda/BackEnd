const { prisma } = require("../config");

const oooRooms = [
  {
    room: {
      connect: { id: 105 }
    },
    user: {
      connect: { id: 3 }
    },
    reservation: {
      connect: { id: 1 }
    },
    reason: "Segs party",
    from: new Date(),
    until: new Date(),
    department: {
      connect: { id: 1 }
    },
    description: "Room cleaned thoroughly, ready for next guest.",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function oooRoomSeed() {
  for (let oooRoom of oooRooms) {
    await prisma.oooRoom.create({
      data: oooRoom,
    });
  }
}

module.exports = { oooRoomSeed };
