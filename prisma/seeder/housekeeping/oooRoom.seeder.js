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
    xType: "OOO",
    reason: "Big hole in the celling",
    from: new Date(),
    until: new Date(),
    department: {
      connect: { id: 1 }
    },
    description: "Room cleaned thoroughly, ready for next guest.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    room: {
      connect: { id: 103 }
    },
    user: {
      connect: { id: 3 }
    },
    reservation: {
      connect: { id: 1 }
    },
    xType: "OM",
    reason: "Because bom explode",
    from: new Date(),
    until: new Date(),
    department: {
      connect: { id: 1 }
    },
    description: "Room cleaned thoroughly, ready for next guest.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    room: {
      connect: { id: 102 }
    },
    user: {
      connect: { id: 3 }
    },
    reservation: {
      connect: { id: 1 }
    },
    xType: "HU",
    reason: "Cant have home in detroit",
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
    await prisma.oooOmRoom.create({
      data: oooRoom,
    });
  }
}

module.exports = { oooRoomSeed };
