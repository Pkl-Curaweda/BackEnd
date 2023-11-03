const { prisma } = require("../../config");

const rooms = [
  {
    
  },
];

async function roomSeed() {
  for (let room of rooms) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    await prisma.room.create({
      data: room,
    });
  }
}

module.exports = { roomSeed };
