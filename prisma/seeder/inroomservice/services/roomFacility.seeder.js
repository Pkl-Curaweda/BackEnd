const { prisma } = require("../../config");

const roomFacilitys = [
  {
    name: "Family Room",
    roomId: "1",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Deluxe Room",
    roomId: "2",
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function roomSeed() {
  for (let roomFacility of roomFacilitys) {
    await prisma.room.create({
      data: roomFacility,
    });
  }
}

module.exports = { roomSeed };
