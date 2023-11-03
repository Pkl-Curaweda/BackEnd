const { prisma } = require("../../config");

const roomFacilitys = [
  {
    name: "Family Room",
    roomId: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Deluxe Room",
    roomId: 2,
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function roomFacilitySeed() {
  for (let roomFacility of roomFacilitys) {
    await prisma.roomFacility.create({
      data: roomFacility,
    });
  }
}

module.exports = { roomFacilitySeed };